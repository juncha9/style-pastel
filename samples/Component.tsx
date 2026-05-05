/*
 * Style Pastel sample — JSX/TSX inline style 형태 모음.
 * - style="..." (string literal)
 * - style={`...`}    (tagged template — Style Pastel 전용 패턴, ${} interpolation 없음)
 */

import * as React from 'react';

export function Card(): JSX.Element {
    return (
        <div
            style="display: flex; flex-direction: column; gap: 12px; padding: 16px; width: 320px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);"
        >
            <h3
                style={`font-family: 'Inter', sans-serif; font-size: 18px; font-weight: 600; color: #111827; letter-spacing: -0.01em; line-height: 1.3; margin: 0;`}
            >
                Pastel Card
            </h3>

            <p
                style={`font-size: 14px; line-height: 1.6; color: #4b5563; margin: 0; white-space: normal; word-break: keep-all;`}
            >
                Inline style이 카테고리별로 색칠되는지 확인.
            </p>

            <button
                type="button"
                style={`display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 14px; height: 36px; background: #ec4899; color: #fff; border: none; border-radius: 8px; cursor: pointer; transition: background-color 150ms ease, transform 100ms ease; transform: translateZ(0); font-size: 13px; font-weight: 600;`}
            >
                Click me
            </button>
        </div>
    );
}

export function Hero(): JSX.Element {
    return (
        <section
            style="--brand: #6366f1; --brand-fg: #fff; --radius: 16px; position: relative; display: grid; place-items: center; min-height: 360px; padding: 48px 24px; background: radial-gradient(circle at top, var(--brand), #312e81); color: var(--brand-fg); border-radius: var(--radius); overflow: hidden; isolation: isolate;"
        >
            <div
                style={`position: absolute; inset: 0; background-image: url('/noise.png'); background-size: 200px 200px; mix-blend-mode: overlay; opacity: 0.15; pointer-events: none;`}
            />
            <h1
                style={`font-family: ui-serif, Georgia, serif; font-size: clamp(28px, 4vw, 56px); font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; text-align: center; margin: 0;`}
            >
                Hello, Pastel!
            </h1>
        </section>
    );
}

export function Loader(): JSX.Element {
    return (
        <span
            style={`display: inline-block; width: 24px; height: 24px; border: 3px solid rgba(0, 0, 0, 0.1); border-top-color: #6366f1; border-radius: 50%; animation: spin 700ms linear infinite; will-change: transform;`}
        />
    );
}
