<!--
  Style Pastel sample — Svelte inline style 형태.
  Svelte는 string-based style="..." 만 사용.
-->

<script lang="ts">
    let count = 0;
</script>

<main
    style="display: grid; grid-template-rows: auto 1fr auto; min-height: 100vh; padding: 24px; gap: 24px; background: #f9fafb; color: #111827; font-family: 'Inter', sans-serif;"
>
    <header
        style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);"
    >
        <h1 style="font-size: 18px; font-weight: 700; letter-spacing: -0.01em; margin: 0;">
            Style Pastel — Svelte
        </h1>
        <nav style="display: flex; align-items: center; gap: 12px;">
            <a
                href="#a"
                style="font-size: 13px; color: #6366f1; text-decoration: none; padding: 4px 8px; border-radius: 6px; transition: background-color 120ms ease; cursor: pointer;"
            >
                Docs
            </a>
            <a
                href="#b"
                style="font-size: 13px; color: #6366f1; text-decoration: none; padding: 4px 8px; border-radius: 6px; cursor: pointer;"
            >
                Source
            </a>
        </nav>
    </header>

    <section
        style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 32px; background: #fff; border: 1px solid #e5e7eb; border-radius: 16px;"
    >
        <p
            style="font-size: 14px; line-height: 1.6; color: #4b5563; text-align: center; max-width: 480px; margin: 0; white-space: pre-wrap; word-break: keep-all;"
        >
            카테고리별 색이 잘 분리되어 보이는지 확인하기 위한 샘플.
        </p>
        <button
            type="button"
            on:click={() => (count += 1)}
            style="appearance: none; display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 36px; padding: 0 16px; background: #6366f1; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; transition: background-color 150ms ease, transform 100ms ease; transform: translateZ(0); user-select: none;"
        >
            Clicked {count} times
        </button>
    </section>

    <footer
        style="display: flex; align-items: center; justify-content: center; padding: 12px; font-size: 12px; color: #9ca3af; letter-spacing: 0.02em;"
    >
        Pastel sample · Svelte
    </footer>
</main>
