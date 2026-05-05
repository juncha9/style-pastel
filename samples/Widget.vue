<!--
  Style Pastel sample — Vue inline style 형태.
  - :style="..."  (Vue property binding)
  - style="..."   (정적 inline style)
-->

<template>
    <div
        :style="`display: flex; flex-direction: column; gap: 8px; padding: 12px 16px; min-width: 240px; background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 10px;`"
    >
        <header
            style="display: flex; align-items: center; justify-content: space-between; gap: 8px; padding-bottom: 8px; border-bottom: 1px solid #fbcfe8;"
        >
            <span
                :style="`font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; color: #831843; letter-spacing: 0.04em; text-transform: uppercase;`"
            >
                Notice
            </span>
            <button
                type="button"
                :style="`appearance: none; background: transparent; border: none; cursor: pointer; padding: 4px; color: #831843; font-size: 14px; line-height: 1;`"
            >
                ×
            </button>
        </header>

        <p
            style="font-size: 14px; line-height: 1.5; color: #831843; margin: 0; white-space: pre-wrap; word-break: keep-all;"
        >
            Vue 측 :style 바인딩에서도 카테고리 색이 그대로 보여야 합니다.
        </p>

        <div
            :style="`display: grid; grid-template-columns: 1fr auto; column-gap: 8px; padding: 8px 0; transition: background-color 150ms ease; cursor: pointer; user-select: none;`"
        >
            <span style="font-size: 13px; color: #9d174d;">Action</span>
            <span
                :style="`font-size: 12px; color: #6b7280; transform: translateY(1px); transition: color 120ms ease;`"
            >
                →
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
// no logic — purely a styling sample
</script>
