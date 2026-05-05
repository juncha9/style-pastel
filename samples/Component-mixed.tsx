/*
 * Style Pastel sample — string / object 두 형태를 한 파일에서 비교.
 *
 * 같은 의미의 스타일을 (A) string 형태와 (B) object 형태로 짝지어 배치한 뒤,
 * 두 형태가 동일한 카테고리 색으로 칠해지는지 한 화면에서 diff 검증할 수 있게 한다.
 * 마지막 섹션은 토큰 추출기 / 분류기가 다뤄야 할 엣지 케이스 모음.
 *
 * 인덱스
 *  §1  Card           — string / object 1:1 비교
 *  §2  Hero           — CSS 변수, var(), gradient — string / object 비교
 *  §3  엣지 (string)  — `;`, `,`, escape, tagged template, single quote, ngStyle
 *  §4  엣지 (object)  — spread, computed key, method def, 주석, ${interpolation}, quoted/vendor
 *  §5  미지원 패턴    — 삼항, 함수 호출, 변수 참조, ${} 포함 tagged template (skip 되어야 함)
 */

import * as React from 'react';

// ---------------------------------------------------------------------------
// §1  Card — string / object 1:1 비교
// ---------------------------------------------------------------------------

export function CardString(): JSX.Element {
    return (
        <div
            style="display: flex; flex-direction: column; gap: 12px; padding: 16px; width: 320px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);"
        >
            <h3
                style={`font-size: 18px; font-weight: 600; color: #111827; letter-spacing: -0.01em; line-height: 1.3; margin: 0;`}
            >
                String-form Card
            </h3>
        </div>
    );
}

export function CardObject(): JSX.Element {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                padding: 16,
                width: 320,
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
            }}
        >
            <h3
                style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: '#111827',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.3,
                    margin: 0,
                }}
            >
                Object-form Card
            </h3>
        </div>
    );
}

// ---------------------------------------------------------------------------
// §2  Hero — CSS 변수 + var() — string / object 비교
// ---------------------------------------------------------------------------

export function HeroString(): JSX.Element {
    return (
        <section
            style="--brand: #6366f1; --brand-fg: #fff; --radius: 16px; padding: 48px 24px; background: radial-gradient(circle at top, var(--brand), #312e81); color: var(--brand-fg); border-radius: var(--radius);"
        />
    );
}

export function HeroObject(): JSX.Element {
    return (
        <section
            style={{
                '--brand': '#6366f1',
                '--brand-fg': '#fff',
                '--radius': '16px',
                padding: '48px 24px',
                background: 'radial-gradient(circle at top, var(--brand), #312e81)',
                color: 'var(--brand-fg)',
                borderRadius: 'var(--radius)',
            }}
        />
    );
}

// ---------------------------------------------------------------------------
// §3  엣지 케이스 — string 형태
// ---------------------------------------------------------------------------

// 값 안의 `;` `,` 가 declaration 구분자로 오인되면 안 됨.
// rgba / linear-gradient / data: URL / quoted font-family 모두 한 declaration.
export function StringNestedSeparators(): JSX.Element {
    return (
        <>
            <div style="background: linear-gradient(0deg, rgba(0, 0, 0, 0.6), rgba(255, 255, 255, 0.1)); color: rgb(255, 0, 0);" />
            <div style="background-image: url('data:image/svg+xml;utf8,<svg xmlns=&quot;...&quot;/>'); background-size: 16px 16px;" />
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; font-feature-settings: 'liga' 1, 'kern' 1;" />
        </>
    );
}

// 빈 declaration / 중복 `;` / trailing whitespace — 분류기가 빈 토큰을 만들지 않아야 함.
export function StringDegenerate(): JSX.Element {
    return (
        <>
            <div style=";;; padding: 8px ;;; margin: 0;;" />
            <div style="   color:   #333  ;   " />
            <div style="" />
        </>
    );
}

// single quote / tagged template (interpolation 없음 → string fragment 로 인식).
export function StringQuoteVariants(): JSX.Element {
    const flag = false;
    return (
        <>
            <div style='display: grid; grid-template-columns: 1fr 2fr;' />
            <div style={`opacity: ${flag ? 1 : 0.5};`} />
            <div style={`gap: 8px; padding: 12px;`} />
        </>
    );
}

// Vue / Angular 어트리뷰트 — string fragment 추출 패턴이 동일하게 동작해야 함.
export function StringFrameworkAttrs(): JSX.Element {
    // 실제 React에서 :style 은 prop이 아니지만 추출기 입장에서는 같은 패턴.
    return (
        <>
            {/* @ts-ignore — Vue-style attr 추출 검증용 */}
            <div :style="color: red; padding: 4px;" />
            {/* @ts-ignore — Angular-style attr 추출 검증용 */}
            <div [style]="margin: 0; line-height: 1.4;" />
            {/* @ts-ignore */}
            <div ngStyle="font-size: 14px; font-weight: 500;" />
        </>
    );
}

// ---------------------------------------------------------------------------
// §4  엣지 케이스 — object 형태
// ---------------------------------------------------------------------------

// spread / computed key / shorthand method — invalid declaration 은 skip 하고
// 그 뒤 정상 declaration 은 정상 분류되어야 함.
export function ObjectSkipPatterns(): JSX.Element {
    const base = { padding: 8 };
    const dynamicKey = 'color';
    return (
        <div
            style={{
                ...base,                // skip
                [dynamicKey]: 'red',    // skip
                fontSize: 14,           // 정상
                lineHeight: 1.5,        // 정상
                // shorthand method 는 v1에서 skip — 그 뒤 정상 declaration 은 정상
                // @ts-ignore — invalid CSSProperties, 추출기 robustness 검증용
                handler() { return 1; },
                margin: 0,              // 정상
            }}
        />
    );
}

// 주석 안의 `,` `:` `;` 가 key/value/구분자로 오인되면 안 됨.
export function ObjectComments(): JSX.Element {
    return (
        <div
            style={{
                // 한 줄 주석 — color: red; padding: 1px, 2px, 3px 가 들어있어도 무시
                display: 'flex',
                /*
                 * 블록 주석 — 여러 줄, 안에 fake decl: `gap: 999`, `padding: 999`
                 * 모두 다음 줄의 정상 decl 에 영향 없어야 함.
                 */
                gap: 8,
                padding: 16,
            }}
        />
    );
}

// 템플릿 리터럴 값 안의 `${}` interpolation — 그 안의 `,` 가 declaration 끝으로 오인되면 안 됨.
export function ObjectTemplateValue({ shadow = 4 }: { shadow?: number }): JSX.Element {
    return (
        <div
            style={{
                // ${} 안의 콤마는 같은 declaration 안에 있음
                transform: `translate(${shadow}px, -${shadow / 2}px) rotate(2deg)`,
                boxShadow: `0 ${shadow}px ${shadow * 4}px rgba(0, 0, 0, 0.08)`,
                // 중첩 괄호 — calc / rgba 등
                width: 'calc(100% - 16px)',
                color: 'rgba(0, 0, 0, 0.4)',
                // 문자열 안의 `,` 도 안전
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
            }}
        />
    );
}

// quoted kebab key + vendor prefix + custom property + ms 소문자 컨벤션.
export function ObjectKeyVariants(): JSX.Element {
    return (
        <div
            style={{
                // camelCase
                paddingInlineStart: 24,
                paddingBlock: '12px 16px',
                // vendor prefix (leading uppercase → '-webkit-…')
                WebkitMaskImage: 'linear-gradient(black, transparent)',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                // ms 는 React 컨벤션 상 leading 소문자 — 분류 룰엔 없으므로 'other' 로 떨어져야 함
                msOverflowStyle: 'none',
                // quoted kebab + custom property
                'border-top-left-radius': 12,
                '--brand': '#ec4899',
                '--brand-fg': '#fff',
                color: 'var(--brand-fg)',
                background: 'var(--brand)',
            }}
        />
    );
}

// 빈 객체 / 빈 값 — 토큰 0개여야 함.
export function ObjectEmpty(): JSX.Element {
    return (
        <>
            <div style={{}} />
            <div
                style={{
                    // 주석만 있는 객체
                }}
            />
        </>
    );
}

// ---------------------------------------------------------------------------
// §5  v1 미지원 패턴 — 추출기가 통째로 skip 해야 함 (false-positive 검증용)
// ---------------------------------------------------------------------------

export function UnsupportedExpressions(): JSX.Element {
    const dynamicStyle = { padding: 8 };
    const cond = true;
    function getStyle() {
        return { color: 'red' };
    }
    const value = 'green';
    return (
        <>
            {/* 변수 참조 — { 다음이 식별자 → skip */}
            <div style={dynamicStyle} />

            {/* 함수 호출 — { 다음이 식별자/`(` → skip */}
            <div style={getStyle()} />

            {/* 삼항 — { 다음이 식별자/literal/`(` → skip
                (각 분기의 string literal 자체는 style attr이 아니라 JS expression 이므로 분류 대상 아님) */}
            <div style={cond ? 'color: red' : 'color: blue'} />

            {/* tagged template 인데 ${} interpolation 포함 — 추출기는 통째로 skip
                (interpolation 으로 declaration 경계가 깨질 수 있어 v1 미지원) */}
            <div style={`color: ${value}; padding: 8px;`} />

            {/* 객체 expression 의 leading whitespace 다음에 식별자 — skip */}
            <div style={ Object.assign({}, { color: 'red' }) } />
        </>
    );
}
