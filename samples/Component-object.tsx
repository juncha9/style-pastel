/*
 * Style Pastel sample — JSX 객체 형태 (style={{ ... }}).
 * camelCase 키, vendor prefix(첫 글자 대문자), quoted kebab 키, '--brand' 커스텀 프로퍼티,
 * 문자열/템플릿 리터럴/주석/중첩 괄호가 섞인 값까지 한 번에 검증.
 */

import * as React from 'react';

export function ObjectCard(): JSX.Element {
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
                    fontFamily: "'Inter', sans-serif",
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

            <p
                style={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: '#4b5563',
                    margin: 0,
                    whiteSpace: 'normal',
                    wordBreak: 'keep-all',
                }}
            >
                JSX object 형태에서 카테고리 색이 잘 분리되는지 확인.
            </p>

            <button
                type="button"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    height: 36,
                    background: '#ec4899',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'background-color 150ms ease, transform 100ms ease',
                    transform: 'translateZ(0)',
                    fontSize: 13,
                    fontWeight: 600,
                }}
            >
                Click me
            </button>
        </div>
    );
}

// vendor prefix + quoted key + custom property + 템플릿 리터럴 값
export function VendorAndQuoted({ shadow = 4 }: { shadow?: number }): JSX.Element {
    return (
        <section
            style={{
                // camelCase
                paddingInlineStart: 24,
                paddingInlineEnd: 24,
                paddingBlock: '12px 16px',
                marginBlockEnd: 32,
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gridAutoFlow: 'row dense',

                // vendor prefix (leading uppercase → '-webkit-…')
                WebkitMaskImage: 'linear-gradient(black, transparent)',
                WebkitMaskSize: 'cover',
                WebkitTextStroke: '1px black',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',

                // quoted kebab + custom property
                'border-top-left-radius': 12,
                'border-bottom-right-radius': 12,
                '--brand': '#ec4899',
                '--brand-fg': '#fff',
                color: 'var(--brand-fg)',
                background: 'var(--brand)',

                // 템플릿 리터럴 + ${} interpolation 값 안에 `,` 있어도 split 되면 안 됨
                transform: `translate(${shadow}px, -${shadow / 2}px) rotate(2deg)`,
                boxShadow: `0 ${shadow}px ${shadow * 4}px rgba(0, 0, 0, 0.08)`,

                // nested 괄호 — calc / rgba 등
                width: 'calc(100% - 16px)',
                background2: 'rgba(0, 0, 0, 0.4)',
            }}
        />
    );
}

// spread / computed key / 메서드 — 무시되어야 함 (분류 시도 안 함)
export function SpreadAndComputed(): JSX.Element {
    const base = { padding: 8 };
    const dynamicKey = 'color';
    return (
        <div
            style={{
                ...base,
                [dynamicKey]: 'red',
                fontSize: 14, // 정상 — 위 두 줄 skip 후에도 잘 매칭
                lineHeight: 1.5,
            }}
        />
    );
}

// 주석이 섞인 객체 — 주석 안의 `,` 가 declaration 을 자르면 안 됨
export function WithComments(): JSX.Element {
    return (
        <div
            style={{
                // 한 줄 주석, 안에 콤마 a, b, c 가 있어도 무시
                display: 'flex',
                /* 블록 주석
                   여러 줄에 걸쳐 있어도 OK */
                gap: 8,
                padding: 16,
            }}
        />
    );
}
