<script setup lang="ts">
import { ref } from 'vue';

const open = ref(false);
const accent = '#7c3aed';
</script>

<template>
    <!-- Vue: plain style="" 과 :style="..." (binding) 모두 매칭 -->
    <article style="
        display: grid;
        grid-template-columns: 240px 1fr;
        gap: 24px;
        padding: 32px;
        background: #fafafa;
        border-radius: 12px;
        font-family: system-ui, sans-serif;
        color: #111827;
        transition: box-shadow 200ms ease;
    ">
        <aside :style="`
            position: sticky;
            top: 16px;
            padding: 16px;
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            font-size: 13px;
        `">
            Sidebar
        </aside>

        <main :style="'display: flex; flex-direction: column; gap: 16px;'">
            <h2 style="font-size: 24px; font-weight: 800; letter-spacing: -0.02em;">Page title</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #374151;">
                Vue's <code style="font-family: ui-monospace, monospace; color: #2563eb;">:style</code>
                binding is detected the same as plain <code style="color: #2563eb;">style</code>.
            </p>

            <!-- custom property + var() in Vue context -->
            <button :style="`
                --tone: ${accent};
                padding: 10px 18px;
                background: var(--tone);
                color: #fff;
                border: 0;
                border-radius: 999px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 150ms ease;
            `">
                Action
            </button>
        </main>
    </article>
</template>
