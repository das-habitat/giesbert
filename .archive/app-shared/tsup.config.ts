import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/dtos/index.ts', 'src/enums.ts'],
  format: ['esm', 'cjs'],
  outDir: 'dist',
  dts: true,
  clean: true,
});
