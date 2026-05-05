<script lang="ts">
    let count = 0;
    const accent = '#10b981';
</script>

<!--
    Svelte: 일반 style="..." 과 표현식 form 모두 매칭.
    Svelte 고유 `style:property={value}` 은 V0.0.1 미지원 (별도 form).
-->
<div
    style="
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 16px;
        background: #ecfdf5;
        border: 1px solid #a7f3d0;
        border-radius: 10px;
        font-family: system-ui, sans-serif;
        font-size: 14px;
        color: #065f46;
    "
>
    <span style="font-weight: 700; letter-spacing: -0.01em;">Count</span>
    <span style="font-variant-numeric: tabular-nums; min-width: 32px; text-align: right;">
        {count}
    </span>
    <button
        on:click={() => (count += 1)}
        style="
            margin-inline-start: auto;
            padding: 6px 12px;
            background: {accent};
            color: #fff;
            border: 0;
            border-radius: 999px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 120ms ease, opacity 120ms ease;
        "
    >
        +1
    </button>
</div>

<!-- custom property + var() reference -->
<div style="--ring: {accent}; outline: 2px solid var(--ring); outline-offset: 2px; padding: 8px; border-radius: 6px;">
    Ringed
</div>
