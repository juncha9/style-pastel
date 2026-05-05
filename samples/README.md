# Style Pastel — samples

`launch.json`의 `debug` 설정이 이 폴더를 워크스페이스로 열어 Extension Host를 띄운다.
F5로 실행하면 아래 파일들이 모두 인라인 스타일 하이라이트가 적용된 상태로 보여야 한다.

| 파일                | 검증 포인트                                                                      |
| ------------------- | -------------------------------------------------------------------------------- |
| `index.html`        | 6개 카테고리(layout/box/typography/surface/motion/other) + 커스텀 변수 + var()  |
| `multi-line.html`   | 멀티라인 style 속성, 멀티라인 declaration(linear-gradient, box-shadow, transition) |
| `edge-cases.html`   | 빈 style, 따옴표 두 종류, URL/data URI, calc/clamp, trailing-semi 없음, !important, Angular `[style]`/`ngStyle`, Vue `:style` 패턴 |
| `component.tsx`     | JSX 문자열 form / 객체 form / tagged template — camelCase, vendor prefix(Webkit*), 따옴표 키, spread, computed key |
| `page.vue`          | `<template>` 안의 `style=""` 과 `:style="..."` 양쪽                              |
| `widget.svelte`     | Svelte 일반 `style="..."` 과 그 안의 `{}` interpolation                          |
| `header.astro`      | Astro `style="..."` (HTML 형식) 과 expression `style={\`...\`}`                  |

## 빠른 검증 체크리스트

- [ ] `display: flex` / `position: sticky` 의 property name이 **파랑(layout)**
- [ ] `padding: 16px` / `width: 100%` 의 property name이 **에메랄드(box)**
- [ ] `font-size: 14px` / `color: #111827` 의 property name이 **앰버(typography)**
- [ ] `background:` / `border-radius:` / `box-shadow:` 의 property name이 **핑크(surface)**
- [ ] `transition:` / `transform:` 의 property name이 **바이올렛(motion)**
- [ ] `cursor:` / `user-select:` / `scroll-*` property name이 **회색(other)**
- [ ] `--brand` 선언과 `var(--brand)` 참조 양쪽 모두 **슬레이트(cool)** 톤
- [ ] `rgb(0, 0, 0)` 안의 콤마/세미콜론으로 declaration이 끊기지 않음
- [ ] 멀티라인 declaration(`box-shadow:` 같은)도 anchor가 단 한 번만 칠해짐
- [ ] `cn()` 같은 helper는 영향 없음 (이건 Tailwind Pastel 영역)
