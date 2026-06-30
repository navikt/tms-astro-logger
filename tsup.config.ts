import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/index.ts', 'src/team-log/index.ts'],
    format: 'esm',
    dts: true,
    sourcemap: true,
    clean: true,
    metafile: true,
})
