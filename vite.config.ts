import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src'],
      exclude: ['src/demo.tsx', 'src/demo-entry.tsx', 'src/test'],
    }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'SpriteLite',
      formats: ['es', 'cjs'],
      fileName: (format) => format === 'cjs' ? 'index.cjs' : 'index.js',
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime'],
    },
    copyPublicDir: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
