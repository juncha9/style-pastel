// 본 익스텐션이 다루는 에디터 언어. languageId의 부분집합.
export type SourceLanguage =
    | 'typescriptreact'
    | 'javascriptreact'
    | 'html'
    | 'vue'
    | 'svelte'
    | 'astro';

// CSS property 카테고리 (tailwind-pastel과 동일한 6개 그룹).
// 같은 색 팔레트를 공유해 두 익스텐션을 함께 켜도 시각 언어가 일관되게 유지된다.
export type StyleCategory =
    | 'layout'      // display + position + flex/grid 정렬 + overflow + visibility 등
    | 'box'         // sizing + spacing (width/height/padding/margin/box-sizing)
    | 'typography'  // font/color/text-*/line-height/letter-spacing 등
    | 'surface'     // background/border/radius/shadow/outline/opacity/filter/mask 등
    | 'motion'      // transition/animation/transform 계열
    | 'other';      // cursor/user-select/scroll-*/touch-*/appearance 등 + 미분류 fallback

export interface CategoryStyle {
    readonly category: StyleCategory;
    readonly color: string; // rgb(r,g,b)
    readonly label: string;
}

// 문서에서 잘라낸 텍스트 조각 + 그 시작 offset.
// style 속성 본문 또는 그 안의 declaration 부분을 표현.
export interface TextFragment {
    readonly text: string;
    readonly offset: number;
}

// 문서 내에서 inline-style declaration 하나를 나타내는 인터페이스.
//  - [start, end)              : declaration 전체 (property + ':' + value, ';' 제외)
//  - [anchorStart, anchorEnd)  : property name 영역 — 분류를 결정한 부분 (e.g. `padding`, `--brand`)
//  - raw                       : declaration 전체 텍스트
//  - category                  : property name으로 결정된 카테고리 (`--xxx` 사용자 변수는 'other')
//  - isCustomProperty          : property name이 `--xxx` 형식이면 true (cssVariable 색으로 anchor 표시)
export interface StyleToken {
    readonly start: number;
    readonly end: number;
    readonly anchorStart: number;
    readonly anchorEnd: number;
    readonly raw: string;
    readonly category: StyleCategory;
    readonly isCustomProperty: boolean;
}
