import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/extension.ts'],
    format: ['cjs'],
    target: 'node18',
    outDir: 'dist',
    external: ['vscode'],
    noExternal: [/^[@./]/],
    bundle: true,
    splitting: false,
    sourcemap: true,
    clean: true,
});
