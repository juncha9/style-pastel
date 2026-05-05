import * as vscode from 'vscode';
import {
    DASH_PREFIX_LOOKUP,
    EXACT_NAME_LOOKUP,
    STYLE_ATTR_PATTERN,
} from '../_defs';
import { StyleToken, TextFragment, StyleCategory } from '@/_types';

// ---------------------------------------------------------------------------
// CSS property classification
// ---------------------------------------------------------------------------

/*
 * 이미 정규화된 CSS property name을 카테고리로 분류한다.
 *  - `--xxx`         → category 'other', isCustomProperty=true
 *  - exact 매치 우선 (`width`, `color`)
 *  - 그 외엔 가장 긴 dash prefix가 이긴다 (`padding-inline-start` → `padding-`)
 */
function classifyCssProperty(name: string): {
    category: StyleCategory;
    isCustomProperty: boolean;
} {
    if (name.startsWith('--')) {
        return { category: 'other', isCustomProperty: true };
    }
    const hitExact = EXACT_NAME_LOOKUP.get(name);
    if (hitExact != null) {
        return { category: hitExact.category, isCustomProperty: false };
    }
    let lastDash = name.lastIndexOf('-');
    while (lastDash > 0) {
        const candidate = name.slice(0, lastDash);
        const hit = DASH_PREFIX_LOOKUP.get(candidate);
        if (hit != null) {
            return { category: hit.category, isCustomProperty: false };
        }
        lastDash = name.lastIndexOf('-', lastDash - 1);
    }
    return { category: 'other', isCustomProperty: false };
}

/*
 * React 스타일 객체의 키(camelCase)를 CSS property name(kebab-case)으로 변환한다.
 *  - 이미 `-` 를 포함하면 변환하지 않는다 (kebab 또는 `--brand` 같은 quoted key는 그대로).
 *  - 첫 글자가 대문자면 vendor prefix 로 보고 leading `-` 를 붙인다 (`WebkitMaskImage` → `-webkit-mask-image`).
 *  - `ms` lowercase 컨벤션은 React 가 그대로 쓰지만 우리 분류 룰엔 `-ms-*`가 없어 추가 처리하지 않는다.
 */
function reactStyleKeyToCssName(key: string): string {
    if (key.length === 0 || key.includes('-')) {
        return key;
    }
    let out = '';
    for (let i = 0; i < key.length; i++) {
        const code = key.charCodeAt(i);
        if (code >= 65 && code <= 90) {
            out += '-' + String.fromCharCode(code + 32);
        } else {
            out += key[i];
        }
    }
    return out;
}

// ---------------------------------------------------------------------------
// extraction
// ---------------------------------------------------------------------------

/*
 * findStyleFragments 가 두 종류의 본문을 함께 수집하기 위한 내부 타입.
 *  - kind 'string' : `style="..."` / `style={`...`}` / `:style="..."` 의 CSS 문자열 본문
 *  - kind 'object' : JSX `style={{...}}` 의 JS 객체 리터럴 본문 (외측 `{`/`}` 제외)
 */
type ScannedFragment = TextFragment & { readonly kind: 'string' | 'object' };

/*
 * `start` 위치(`"` `'` `` ` ``)에서 시작하는 string literal 의 닫는 따옴표 다음 인덱스.
 * 못 찾으면 text.length 를 반환. backslash escape 인지.
 */
function findStringCloserIndex(text: string, start: number, quote: string): number {
    let i = start + 1;
    while (i < text.length) {
        const ch = text[i];
        if (ch === '\\') {
            i += 2;
            continue;
        }
        if (ch === quote) {
            return i + 1;
        }
        i++;
    }
    return text.length;
}

/*
 * JS 토큰 하나를 건너뛴다. text[start] 가
 *  - 문자열/템플릿 따옴표면 닫는 따옴표 다음 인덱스 (template 의 `${...}` 안은 brace-balance 로 skip)
 *  - `/` 로 시작하는 라인/블록 코멘트면 코멘트 끝 다음 인덱스
 *  - 그 외엔 start + 1
 */
function skipJsLiteralOrComment(text: string, start: number): number {
    const ch = text[start];
    if (ch === '"' || ch === "'") {
        return findStringCloserIndex(text, start, ch);
    }
    if (ch === '`') {
        let i = start + 1;
        while (i < text.length) {
            const c = text[i];
            if (c === '\\') {
                i += 2;
                continue;
            }
            if (c === '`') {
                return i + 1;
            }
            if (c === '$' && text[i + 1] === '{') {
                i = findBraceCloserIndex(text, i + 1);
                continue;
            }
            i++;
        }
        return text.length;
    }
    if (ch === '/' && text[start + 1] === '/') {
        let i = start + 2;
        while (i < text.length && text[i] !== '\n') {
            i++;
        }
        return i;
    }
    if (ch === '/' && text[start + 1] === '*') {
        let i = start + 2;
        while (i + 1 < text.length && !(text[i] === '*' && text[i + 1] === '/')) {
            i++;
        }
        return Math.min(i + 2, text.length);
    }
    return start + 1;
}

/*
 * text[openIdx] 가 `{` 일 때 그에 매칭되는 `}` 의 다음 인덱스를 반환.
 * 문자열/템플릿/주석 안의 brace 는 무시한다. 못 찾으면 text.length.
 */
function findBraceCloserIndex(text: string, openIdx: number): number {
    let depth = 1;
    let i = openIdx + 1;
    while (i < text.length) {
        const ch = text[i];
        if (ch === '"' || ch === "'" || ch === '`'
            || (ch === '/' && (text[i + 1] === '/' || text[i + 1] === '*'))) {
            i = skipJsLiteralOrComment(text, i);
            continue;
        }
        if (ch === '{') {
            depth++;
        } else if (ch === '}') {
            depth--;
            if (depth === 0) {
                return i + 1;
            }
        }
        i++;
    }
    return text.length;
}

/**
 * 문서에서 style 속성 본문 조각(text + 문서 offset + kind)을 모두 수집한다.
 *  - style="..." | style='...' | style={`...`}
 *  - :style="..." (Vue), [style]="..." (Angular), ngStyle="..."
 *  - JSX `style={{...}}` 객체 리터럴 (kind: 'object')
 */
function findStyleFragments(text: string): ScannedFragment[] {

    // openerIdx 위치에 따옴표가 있다고 가정하고, 그 literal의 본문과 offset을 반환한다.
    function extractStringLiteral(openerIndex: number): ScannedFragment | null {
        const openerText = text[openerIndex];
        if (openerText !== '"' && openerText !== "'" && openerText !== '`') {
            return null;
        }
        const closerIndex = findStringCloserIndex(text, openerIndex, openerText);
        if (closerIndex < 1 || text[closerIndex - 1] !== openerText) {
            return null;
        }
        const offset = openerIndex + 1;
        const body = text.slice(offset, closerIndex - 1);
        if (openerText === '`' && body.includes('${')) {
            return null;
        }
        return { offset, text: body, kind: 'string' };
    }

    /*
     * objectOpenIdx 위치의 `{` 에서 시작하는 JS 객체 리터럴의 본문(외측 `{`/`}` 제외)을 반환한다.
     * 매칭되는 `}` 를 찾지 못하면 null. 객체 본문에는 nested 객체/문자열/주석이 그대로 포함된다.
     */
    function extractObjectLiteral(objectOpenIdx: number): ScannedFragment | null {
        if (text[objectOpenIdx] !== '{') {
            return null;
        }
        const closerIndex = findBraceCloserIndex(text, objectOpenIdx);
        if (closerIndex >= text.length || text[closerIndex - 1] !== '}') {
            return null;
        }
        const offset = objectOpenIdx + 1;
        return { offset, text: text.slice(offset, closerIndex - 1), kind: 'object' };
    }

    const fragments: ScannedFragment[] = [];
    let coveredUntil = 0;

    STYLE_ATTR_PATTERN.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = STYLE_ATTR_PATTERN.exec(text)) !== null) {
        if (m.index < coveredUntil) {
            continue;
        }
        /*
         * m[0]: 매치 전체           e.g. ` style="`
         * m[1]: 속성명             e.g. `style` (또는 `[style]`, `ngStyle` 등)
         * m[0] 마지막 문자: opener — `"` | `'` | `` ` `` | `{`
         *
         * `{` opener는 JSX expression — 그 다음 첫 비공백 토큰이
         *   - `` ` `` 면 tagged template 문자열 본문
         *   - `{`  면 JS 객체 리터럴 본문 (style={{...}})
         *  으로 갈라진다. 그 외 expression(함수 호출, 변수 참조 등)은 v1 미지원이라 skip.
         */
        const openerIdx = m.index + m[0].length - 1;
        let fragment: ScannedFragment | null = null;
        if (text[openerIdx] === '{') {
            let j = openerIdx + 1;
            while (j < text.length && /\s/.test(text[j])) {
                j++;
            }
            if (text[j] === '`') {
                fragment = extractStringLiteral(j);
            } else if (text[j] === '{') {
                fragment = extractObjectLiteral(j);
            } else {
                continue;
            }
        } else {
            fragment = extractStringLiteral(openerIdx);
        }
        if (fragment == null) {
            continue;
        }
        fragments.push(fragment);
        coveredUntil = fragment.offset + fragment.text.length + 1;
    }

    return fragments;
}

/**
 * 텍스트 전체에서 inline-style declaration 토큰을 추출한다.
 *
 *  - kind 'string' fragment : `;` 단위 분해 (괄호/대괄호 밖만 구분자)
 *  - kind 'object' fragment : `,` 단위 분해 (괄호/대괄호/중괄호/문자열/주석 밖만 구분자) — JSX style={{...}}
 *
 * e.g. `background: rgb(0, 0, 0); padding: 16px;` → ['background: rgb(0, 0, 0)', ' padding: 16px']
 *      `paddingTop: 16, color: 'red'`             → ['paddingTop: 16', " color: 'red'"]
 */
export function extractStyleTokens(text: string): StyleToken[] {
    function tokenizeStringFragment(fragment: ScannedFragment, out: StyleToken[]): void {
        const { text: body, offset } = fragment;
        let i = 0;
        while (i < body.length) {
            // declaration 시작 — 구분자/공백 skip
            while (i < body.length && (body[i] === ';' || /\s/.test(body[i]))) {
                i++;
            }
            if (i >= body.length) {
                break;
            }
            const declStart = i;
            // declaration 끝 = 다음 ';' (괄호/대괄호 밖)
            let depth = 0;
            while (i < body.length) {
                const ch = body[i];
                if (ch === '(' || ch === '[') {
                    depth++;
                } else if (ch === ')' || ch === ']') {
                    depth = Math.max(0, depth - 1);
                } else if (ch === ';' && depth === 0) {
                    break;
                }
                i++;
            }
            // declaration의 trailing 공백 제외하고 끝 좌표 계산
            let declEnd = i;
            while (declEnd > declStart && /\s/.test(body[declEnd - 1])) {
                declEnd--;
            }
            if (declEnd === declStart) {
                continue;
            }
            /*
             * property name = declStart 부터 첫 `:` 또는 공백 직전까지.
             * declStart 는 외부 루프에서 leading whitespace/`;` 가 이미 skip 된 상태라
             * 별도 시작 정렬은 불필요. 공백으로 끝나면 그 다음 비공백이 `:` 여야 valid.
             */
            let nameEnd = declStart;
            while (nameEnd < declEnd && body[nameEnd] !== ':' && /\S/.test(body[nameEnd])) {
                nameEnd++;
            }
            if (nameEnd >= declEnd || nameEnd === declStart) {
                continue;
            }
            if (body[nameEnd] !== ':') {
                let j = nameEnd;
                while (j < declEnd && /\s/.test(body[j])) {
                    j++;
                }
                if (j >= declEnd || body[j] !== ':') {
                    continue;
                }
            }
            const name = body.slice(declStart, nameEnd);
            const { category, isCustomProperty } = classifyCssProperty(name);
            const declStartAbs = offset + declStart;
            out.push({
                start: declStartAbs,
                end: offset + declEnd,
                anchorStart: declStartAbs,
                anchorEnd: declStartAbs + name.length,
                raw: body.slice(declStart, declEnd),
                category,
                isCustomProperty,
            });
        }
    }

    function tokenizeObjectFragment(fragment: ScannedFragment, out: StyleToken[]): void {
        const { text: body, offset } = fragment;
        let i = 0;
        while (i < body.length) {
            // 다음 declaration 시작 — `,` / 공백 / 주석 skip.
            // 주석을 여기서 미리 건너뛰지 않으면 firstCh 가 `/` 가 되어 skipObjectDeclaration 으로 빠지면서
            // 그 뒤에 오는 정상 declaration 까지 통째로 삼켜진다.
            while (i < body.length) {
                const ch = body[i];
                if (ch === ',' || /\s/.test(ch)) {
                    i++;
                    continue;
                }
                if (ch === '/' && (body[i + 1] === '/' || body[i + 1] === '*')) {
                    i = skipJsLiteralOrComment(body, i);
                    continue;
                }
                break;
            }
            if (i >= body.length) {
                break;
            }
            const declStart = i;

            /*
             * key 영역. 세 형태 지원:
             *  - identifier  : `paddingTop` (camelCase)            → kebab 변환 후 분류
             *  - quoted      : `'padding-top'`, `"--brand"`, `` `…` ``  → 따옴표 안쪽을 그대로 사용
             *  - 그 외(`...spread`, `[expr]`, 메서드 정의 등)는 declaration 자체를 skip
             *
             * key 영역에서의 anchor 는 source 에 보이는 텍스트 그대로 색칠 — 분류는 변환된 이름으로 수행.
             */
            const firstCh = body[i];
            if (firstCh === '.' || firstCh === '[') {
                // spread/computed key — skip 이 declaration 까지
                i = skipObjectDeclaration(body, i);
                continue;
            }

            let keyAnchorOffset: number;
            let keyAnchorLength: number;
            let keyForClassify: string;
            if (firstCh === '"' || firstCh === "'" || firstCh === '`') {
                const closer = findStringCloserIndex(body, i, firstCh);
                if (closer < 1 || body[closer - 1] !== firstCh) {
                    i = skipObjectDeclaration(body, i);
                    continue;
                }
                keyAnchorOffset = i + 1;
                keyAnchorLength = closer - 2 - i;
                keyForClassify = body.slice(i + 1, closer - 1);
                i = closer;
            } else if (firstCh != null && /[A-Za-z_$]/.test(firstCh)) {
                const keyStart = i;
                while (i < body.length && /[A-Za-z0-9_$]/.test(body[i])) {
                    i++;
                }
                keyAnchorOffset = keyStart;
                keyAnchorLength = i - keyStart;
                keyForClassify = reactStyleKeyToCssName(body.slice(keyStart, i));
            } else {
                i = skipObjectDeclaration(body, i);
                continue;
            }

            // key 다음 — 공백 skip 후 `:` 가 와야 한다 (없으면 메서드 정의 등 — skip)
            while (i < body.length && /\s/.test(body[i])) {
                i++;
            }
            if (body[i] !== ':') {
                i = skipObjectDeclaration(body, i);
                continue;
            }
            i++; // `:` 통과

            // value 영역 — top-level `,` 까지 (문자열/주석/괄호/대괄호/중괄호 안은 skip)
            let depth = 0;
            while (i < body.length) {
                const ch = body[i];
                if (ch === '"' || ch === "'" || ch === '`'
                    || (ch === '/' && (body[i + 1] === '/' || body[i + 1] === '*'))) {
                    i = skipJsLiteralOrComment(body, i);
                    continue;
                }
                if (ch === '(' || ch === '[' || ch === '{') {
                    depth++;
                } else if (ch === ')' || ch === ']' || ch === '}') {
                    depth = Math.max(0, depth - 1);
                } else if (ch === ',' && depth === 0) {
                    break;
                }
                i++;
            }

            let declEnd = i;
            while (declEnd > declStart && /\s/.test(body[declEnd - 1])) {
                declEnd--;
            }
            if (keyForClassify.length === 0) {
                continue;
            }
            const { category, isCustomProperty } = classifyCssProperty(keyForClassify);
            const anchorStart = offset + keyAnchorOffset;
            out.push({
                start: offset + declStart,
                end: offset + declEnd,
                anchorStart,
                anchorEnd: anchorStart + keyAnchorLength,
                raw: body.slice(declStart, declEnd),
                category,
                isCustomProperty,
            });
        }
    }

    const fragments = findStyleFragments(text);
    const tokens: StyleToken[] = [];
    for (const fragment of fragments) {
        if (fragment.kind === 'object') {
            tokenizeObjectFragment(fragment, tokens);
        } else {
            tokenizeStringFragment(fragment, tokens);
        }
    }
    return tokens;
}

// 객체 본문에서 invalid declaration 만났을 때 다음 top-level `,` 까지 건너뛴다.
function skipObjectDeclaration(body: string, start: number): number {
    let i = start;
    let depth = 0;
    while (i < body.length) {
        const ch = body[i];
        if (ch === '"' || ch === "'" || ch === '`'
            || (ch === '/' && (body[i + 1] === '/' || body[i + 1] === '*'))) {
            i = skipJsLiteralOrComment(body, i);
            continue;
        }
        if (ch === '(' || ch === '[' || ch === '{') {
            depth++;
        } else if (ch === ')' || ch === ']' || ch === '}') {
            depth = Math.max(0, depth - 1);
        } else if (ch === ',' && depth === 0) {
            return i;
        }
        i++;
    }
    return i;
}

// ---------------------------------------------------------------------------
// position resolution
// ---------------------------------------------------------------------------

/**
 * 텍스트의 각 줄 시작 offset을 미리 계산한다.
 * `\n` 위치를 한 번만 스캔해 두고, offset → Position 변환은 binary search로 처리.
 */
export function buildLineStarts(text: string): number[] {
    const starts: number[] = [0];
    for (let i = 0; i < text.length; i++) {
        if (text.charCodeAt(i) === 10 /* '\n' */) {
            starts.push(i + 1);
        }
    }
    return starts;
}

/**
 * 미리 계산된 lineStarts로 offset 두 개를 vscode.Range로 변환한다.
 * binary search로 offset → Position을 만든다 (line `lo`의 시작이 offset 이하인 가장 큰 lo).
 */
export function rangeFromOffsets(
    lineStarts: number[],
    start: number,
    end: number
): vscode.Range {
    function positionAt(offset: number): vscode.Position {
        let lo = 0;
        let hi = lineStarts.length - 1;
        while (lo < hi) {
            const mid = (lo + hi + 1) >>> 1;
            if (lineStarts[mid] > offset) {
                hi = mid - 1;
            } else {
                lo = mid;
            }
        }
        return new vscode.Position(lo, offset - lineStarts[lo]);
    }
    return new vscode.Range(positionAt(start), positionAt(end));
}
