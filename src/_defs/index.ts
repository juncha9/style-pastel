import { CategoryStyle, SourceLanguage, StyleCategory } from '../_types';

export const UPDATE_DEBOUNCE_MS = 150;

export const SUPPORTED_LANGUAGES: ReadonlySet<SourceLanguage> = new Set<SourceLanguage>([
    'typescriptreact',
    'javascriptreact',
    'html',
    'vue',
    'svelte',
    'astro',
]);

/*
 * inline style을 담을 수 있는 속성 이름.
 * 새 항목을 추가하면 [attr]=`...` (Angular property binding), :attr=`...` (Vue) 형태도
 * 자동 매칭된다.
 */
export const STYLE_ATTRIBUTES: readonly string[] = [
    'style', // HTML, Vue, Svelte, Astro, JSX
    'ngStyle', // Angular
];

/*
 * style 속성의 "여는 부분"을 찾는 패턴.
 * tailwind-pastel의 CLASS_ATTR_PATTERN과 동일한 모양.
 *
 * 매칭 대상: `style="`, ` style='`, `:style="`, `[style]="`, `style={`,
 *           ` ngStyle="` 등 — 본문 직전 opener 문자(`"` `'` `` ` `` `{`) 까지만.
 *
 * 매치 그룹:
 *   match[0]: 매치 전체           e.g. ` style="`
 *   match[1]: 속성명             e.g. `style` (또는 `[style]`, `ngStyle` 등)
 *   match[0] 마지막 문자가 opener — `"` | `'` | `` ` `` | `{` 중 하나
 */
export const STYLE_ATTR_PATTERN = (() => {
    // 각 속성마다 plain(`style`)과 bracket-bound(`[style]`, Angular property binding) 둘 다 매칭
    const escaped = STYLE_ATTRIBUTES.flatMap((a) => [a, `\\[${a}\\]`]).join('|');
    return new RegExp(`(?:\\s|:|\\()(${escaped})\\s*=\\s*['"\`{]`, 'gi');
})();

// 카테고리 색상 팔레트. tailwind-pastel과 동일하게 두 익스텐션을 함께 켜도 시각 언어가 일치하도록.
export const CATEGORY_STYLES: readonly CategoryStyle[] = [
    { category: 'typography', color: 'rgb(251, 191,  36)', label: 'Typography' }, // amber-400
    { category: 'box',        color: 'rgb( 52, 211, 153)', label: 'Box' },        // emerald-400
    { category: 'layout',     color: 'rgb( 96, 165, 250)', label: 'Layout' },     // blue-400
    { category: 'motion',     color: 'rgb(167, 139, 250)', label: 'Motion' },     // violet-400
    { category: 'surface',    color: 'rgb(244, 114, 182)', label: 'Surface' },    // pink-400
    { category: 'other',      color: 'rgb(156, 163, 175)', label: 'Other' },      // gray-400
];

// CSS 커스텀 프로퍼티(`--xxx`) 색상 — 카테고리 6색과 hue를 달리한 cool tone(slate-300).
// `var(--brand)` 의 `--brand` 와 `--brand: red;` 의 `--brand` 모두에 같은 색을 쓴다.
export const CSS_VARIABLE_COLOR = 'rgb(203, 213, 225)'; // slate-300

// 빠른 lookup용 Map.
export const CATEGORY_STYLE_MAP: ReadonlyMap<StyleCategory, CategoryStyle> = new Map(
    CATEGORY_STYLES.map(style => [style.category, style])
);

/*
 * CSS property 이름 → 카테고리 매핑 룰.
 * 우선순위: 더 길고 구체적인 prefix가 먼저 매칭되어야 한다 (예: `min-width` > `min-`).
 * 배열 순서가 곧 우선순위.
 *
 * dash-suffixed 항목(e.g. `padding-`)은 prefix 매칭, 그 외는 exact-name 매칭으로 동작한다.
 */
export const PREFIX_CATEGORY_RULES: ReadonlyArray<readonly [string, StyleCategory]> = [
    // ---- box: sizing ----
    ['min-width', 'box'], ['min-height', 'box'],
    ['max-width', 'box'], ['max-height', 'box'],
    ['min-inline-size', 'box'], ['min-block-size', 'box'],
    ['max-inline-size', 'box'], ['max-block-size', 'box'],
    ['inline-size', 'box'], ['block-size', 'box'],
    ['width', 'box'], ['height', 'box'],
    ['box-sizing', 'box'],

    // ---- box: spacing ----
    ['padding-', 'box'], ['padding', 'box'],
    ['margin-', 'box'], ['margin', 'box'],

    // ---- layout: positioning ----
    ['top', 'layout'], ['right', 'layout'], ['bottom', 'layout'], ['left', 'layout'],
    ['inset-', 'layout'], ['inset', 'layout'],
    ['z-index', 'layout'], ['position', 'layout'],

    // ---- layout: flex / grid / alignment ----
    ['flex-', 'layout'], ['flex', 'layout'],
    ['grid-', 'layout'], ['grid', 'layout'],
    ['gap', 'layout'], ['row-gap', 'layout'], ['column-gap', 'layout'],
    ['justify-', 'layout'], ['align-', 'layout'], ['place-', 'layout'],
    ['order', 'layout'],

    // ---- layout: container / overflow / visibility / object / clear / float / columns ----
    ['column-', 'layout'], ['columns', 'layout'],
    ['container-', 'layout'], ['container', 'layout'],
    ['contain', 'layout'], ['contain-', 'layout'],
    ['content-visibility', 'layout'],
    ['overflow-', 'layout'], ['overflow', 'layout'],
    ['object-', 'layout'],
    ['float', 'layout'], ['clear', 'layout'],
    ['visibility', 'layout'], ['display', 'layout'],
    ['aspect-ratio', 'layout'],
    ['isolation', 'layout'],
    ['box-decoration-break', 'layout'],

    // ---- typography ----
    ['font-', 'typography'], ['font', 'typography'],
    ['-webkit-font-smoothing', 'typography'], ['-moz-osx-font-smoothing', 'typography'],
    ['color', 'typography'],
    ['text-', 'typography'],
    ['line-height', 'typography'],
    ['letter-spacing', 'typography'], ['word-spacing', 'typography'],
    ['white-space', 'typography'], ['word-break', 'typography'],
    ['word-wrap', 'typography'], ['overflow-wrap', 'typography'],
    ['hyphens', 'typography'], ['hanging-punctuation', 'typography'],
    ['vertical-align', 'typography'],
    ['list-', 'typography'], ['list-style', 'typography'],
    ['content', 'typography'], ['quotes', 'typography'],
    ['tab-size', 'typography'],
    ['direction', 'typography'], ['unicode-bidi', 'typography'],
    ['writing-mode', 'typography'],

    // ---- surface: background ----
    ['background-', 'surface'], ['background', 'surface'],

    // ---- surface: border / outline / radius ----
    ['border-', 'surface'], ['border', 'surface'],
    ['outline-', 'surface'], ['outline', 'surface'],

    // ---- surface: shadow / opacity / filter / blend / mask / clip ----
    ['box-shadow', 'surface'],
    ['opacity', 'surface'],
    ['filter', 'surface'], ['backdrop-filter', 'surface'],
    ['mix-blend-mode', 'surface'],
    ['mask-', 'surface'], ['mask', 'surface'],
    ['-webkit-mask-', 'surface'], ['-webkit-mask', 'surface'],
    ['clip-path', 'surface'], ['clip', 'surface'],
    ['paint-order', 'surface'],

    // ---- motion: transition / animation / transform ----
    ['transition-', 'motion'], ['transition', 'motion'],
    ['animation-', 'motion'], ['animation', 'motion'],
    ['transform-', 'motion'], ['transform', 'motion'],
    ['translate', 'motion'], ['rotate', 'motion'], ['scale', 'motion'],
    ['perspective-', 'motion'], ['perspective', 'motion'],
    ['backface-visibility', 'motion'],
    ['will-change', 'motion'],

    // ---- other: interaction (cursor / select / scroll / touch / appearance / etc) ----
    ['cursor', 'other'],
    ['pointer-events', 'other'],
    ['user-select', 'other'], ['-webkit-user-select', 'other'],
    ['touch-action', 'other'],
    ['caret-color', 'other'], ['accent-color', 'other'],
    ['appearance', 'other'], ['-webkit-appearance', 'other'], ['-moz-appearance', 'other'],
    ['resize', 'other'],
    ['scroll-', 'other'], ['scroll', 'other'],
    ['overscroll-', 'other'], ['overscroll-behavior', 'other'],
    ['scrollbar-', 'other'],
    ['ime-mode', 'other'],
    ['all', 'other'],
    ['image-rendering', 'other'],
    ['color-scheme', 'other'],
    ['forced-color-adjust', 'other'], ['print-color-adjust', 'other'],
];

// 매칭 결과 entry. anchorLength는 카테고리 anchor의 표시 길이.
export interface AnchorHit {
    readonly category: StyleCategory;
    readonly anchorLength: number;
}

/*
 * PREFIX_CATEGORY_RULES를 두 lookup으로 미리 분리해 매칭 비용을 O(1) Map 조회로 줄인다.
 *  - DASH_PREFIX_LOOKUP   : `padding-`, `text-` 처럼 trailing `-`로 끝나는 룰. key는 trailing `-`를 뗀 형태.
 *                           property가 `${key}-`로 시작할 때 매칭.
 *  - EXACT_NAME_LOOKUP    : `display`, `color`, `width` 같은 단일 이름 룰. property name이 정확히 같을 때 매칭.
 *
 * 우선순위: exact 매치가 prefix 매치보다 우선해 더 구체적인 룰이 이기게 된다 — 예를 들어
 * `width`는 EXACT_NAME_LOOKUP으로 즉시 box로 분류되고, `padding-top`은 DASH 룰 `padding-`에 걸린다.
 */
export const DASH_PREFIX_LOOKUP: ReadonlyMap<string, AnchorHit> = (() => {
    const map = new Map<string, AnchorHit>();
    for (const [name, category] of PREFIX_CATEGORY_RULES) {
        if (name.endsWith('-') === false) {
            continue;
        }
        const key = name.slice(0, -1);
        map.set(key, { category, anchorLength: key.length });
    }
    return map;
})();

export const EXACT_NAME_LOOKUP: ReadonlyMap<string, AnchorHit> = (() => {
    const map = new Map<string, AnchorHit>();
    for (const [name, category] of PREFIX_CATEGORY_RULES) {
        if (name.endsWith('-')) {
            continue;
        }
        map.set(name, { category, anchorLength: name.length });
    }
    return map;
})();
