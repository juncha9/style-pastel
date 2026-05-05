import * as vscode from 'vscode';
import { CATEGORY_STYLES, CSS_VARIABLE_COLOR } from '../_defs';
import { CategoryStyle, StyleToken, StyleCategory } from '../_types';
import { rangeFromOffsets } from '../_libs';

/*
 * declaration 안에서 `--<id>` 위치를 찾는 패턴.
 * value 영역의 `var(--brand)` 안의 `--brand` 와, custom property declaration의 anchor `--brand`
 * 모두에서 하나의 패턴으로 위치를 잡는다.
 */
const CSS_VARIABLE_PATTERN = /--[A-Za-z_][\w-]*/g;

// anchor 구간 — property name 만 카테고리 색으로 칠한다. declaration 전체에는 데코레이션을 걸지 않음.
function buildAnchorDecoration(style: CategoryStyle): vscode.TextEditorDecorationType {
    return vscode.window.createTextEditorDecorationType({
        color: style.color,
    });
}

// CSS 변수(`--xxx`) anchor — custom property declaration 의 `--brand` 자리. 카테고리 색과 거리 둔 cool tone.
function buildCssVariableDecoration(): vscode.TextEditorDecorationType {
    return vscode.window.createTextEditorDecorationType({
        color: CSS_VARIABLE_COLOR,
    });
}

// CSS 변수 reference — `var(--brand)` 안의 `--brand`. anchor 와 동일 색.
function buildCssVariableReferenceDecoration(): vscode.TextEditorDecorationType {
    return vscode.window.createTextEditorDecorationType({
        color: CSS_VARIABLE_COLOR,
    });
}

/*
 * 데코레이션 인스턴스의 소유자.
 *  - 3종 데코레이션(anchor / cssVariable anchor / cssVariable ref) 생성·해제·적용.
 *  - apply()는 토큰 목록에서 카테고리별 range bucket을 빌드해 setDecorations로 발행한다.
 *  - reinit()은 config 변경 시 색·스타일을 갱신하기 위해 dispose → init을 한 번에 처리.
 */
export class DecorationRegistry implements vscode.Disposable {
    private readonly anchor = new Map<StyleCategory, vscode.TextEditorDecorationType>();
    private cssVariableAnchor: vscode.TextEditorDecorationType | undefined;
    private cssVariableRef: vscode.TextEditorDecorationType | undefined;

    constructor() {
        this.init();
    }

    /** config 변경 시 모든 인스턴스를 새로 만든다. */
    reinit(): void {
        this.dispose();
        this.init();
    }

    dispose(): void {
        for (const d of this.anchor.values()) d.dispose();
        this.cssVariableAnchor?.dispose();
        this.cssVariableRef?.dispose();
        this.anchor.clear();
        this.cssVariableAnchor = undefined;
        this.cssVariableRef = undefined;
    }

    /** 한 에디터의 모든 하이라이트를 비운다 (toggle off 시 사용). */
    clear(editor: vscode.TextEditor): void {
        for (const d of this.anchor.values()) editor.setDecorations(d, []);
        if (this.cssVariableAnchor != null) {
            editor.setDecorations(this.cssVariableAnchor, []);
        }
        if (this.cssVariableRef != null) {
            editor.setDecorations(this.cssVariableRef, []);
        }
    }

    /** 토큰을 카테고리별 bucket으로 모아 setDecorations로 적용한다. */
    apply(editor: vscode.TextEditor, tokens: readonly StyleToken[], lineStarts: number[]): void {
        const anchorBuckets = this.makeBuckets();
        const cssVariableAnchorRanges: vscode.Range[] = [];
        const cssVariableRefRanges: vscode.Range[] = [];

        for (const token of tokens) {
            // property name anchor — `--xxx`는 cssVariable 색, 그 외는 카테고리 색.
            if (token.isCustomProperty) {
                cssVariableAnchorRanges.push(
                    rangeFromOffsets(lineStarts, token.anchorStart, token.anchorEnd)
                );
            } else {
                anchorBuckets.get(token.category)?.push(
                    rangeFromOffsets(lineStarts, token.anchorStart, token.anchorEnd)
                );
            }
            /*
             * value 영역(anchorEnd 이후)의 `--xxx` 참조 — `var(--brand)` 안의 `--brand`.
             * raw 안에서 anchor 뒤쪽 substring만 검사해 anchor 자체와 중복되지 않게 한다.
             */
            const valueOffset = token.anchorEnd - token.start;
            const valueText = token.raw.slice(valueOffset);
            if (valueText.includes('--')) {
                CSS_VARIABLE_PATTERN.lastIndex = 0;
                let m: RegExpExecArray | null;
                while ((m = CSS_VARIABLE_PATTERN.exec(valueText)) !== null) {
                    const varStart = token.anchorEnd + m.index;
                    cssVariableRefRanges.push(
                        rangeFromOffsets(lineStarts, varStart, varStart + m[0].length)
                    );
                }
            }
        }

        this.applyBucketed(editor, anchorBuckets, this.anchor);
        if (this.cssVariableAnchor != null) {
            editor.setDecorations(this.cssVariableAnchor, cssVariableAnchorRanges);
        }
        if (this.cssVariableRef != null) {
            editor.setDecorations(this.cssVariableRef, cssVariableRefRanges);
        }
    }

    private init(): void {
        for (const style of CATEGORY_STYLES) {
            this.anchor.set(style.category, buildAnchorDecoration(style));
        }
        this.cssVariableAnchor = buildCssVariableDecoration();
        this.cssVariableRef = buildCssVariableReferenceDecoration();
    }

    private makeBuckets(): Map<StyleCategory, vscode.Range[]> {
        const m = new Map<StyleCategory, vscode.Range[]>();
        for (const style of CATEGORY_STYLES) {
            m.set(style.category, []);
        }
        return m;
    }

    private applyBucketed(
        editor: vscode.TextEditor,
        buckets: Map<StyleCategory, vscode.Range[]>,
        decorations: Map<StyleCategory, vscode.TextEditorDecorationType>
    ): void {
        for (const [category, ranges] of buckets) {
            const decoration = decorations.get(category);
            if (decoration == null) {
                continue;
            }
            editor.setDecorations(decoration, ranges);
        }
    }
}
