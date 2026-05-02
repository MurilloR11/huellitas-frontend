/// <reference types="vitest" />
import path from 'path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
    dedupe: ['react', 'react-dom'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('react-router') || id.includes('react-dom') || /node_modules\/react\//.test(id))
            return 'vendor-react';
          if (id.includes('@tanstack')) return 'vendor-query';
          if (id.includes('recharts') || id.includes('chart.js') || id.includes('react-chartjs'))
            return 'vendor-charts';
          if (id.includes('@radix-ui')) return 'vendor-radix';
          if (id.includes('@supabase')) return 'vendor-supabase';
          if (id.includes('@sentry')) return 'vendor-sentry';
          if (id.includes('framer-motion')) return 'vendor-motion';
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: false,
    exclude: ['e2e/**', 'node_modules/**', 'dist/**', 'coverage/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
  },
})
