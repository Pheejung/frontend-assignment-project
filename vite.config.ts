import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const REACT_PACKAGES = new Set(['react', 'react-dom', 'scheduler'])
const QUERY_PACKAGES = new Set(['@tanstack/react-query', '@tanstack/query-core'])
const FORM_PACKAGES = new Set(['react-hook-form', '@hookform/resolvers', 'zod'])
const STATE_PACKAGES = new Set(['zustand'])

const CHART_PACKAGES = new Set([
  'recharts',
  'victory-vendor',
  'clsx',
  'eventemitter3',
  'tiny-invariant',
  'decimal.js-light',
  'internmap',
  'd3-array',
  'd3-color',
  'd3-format',
  'd3-interpolate',
  'd3-path',
  'd3-scale',
  'd3-shape',
  'd3-time',
  'd3-time-format',
  '@reduxjs/toolkit',
  'react-redux',
  'redux',
  'redux-thunk',
  'reselect',
  'use-sync-external-store',
  'immer',
  'es-toolkit',
])

function getPackageName(id: string): string | null {
  const modulesPath = 'node_modules/'
  const modulesIndex = id.lastIndexOf(modulesPath)
  if (modulesIndex === -1) {
    return null
  }

  const packagePath = id.slice(modulesIndex + modulesPath.length)
  const segments = packagePath.split('/')
  if (segments.length === 0) {
    return null
  }

  if (segments[0]?.startsWith('@')) {
    const scope = segments[0]
    const name = segments[1]
    if (!scope || !name) {
      return null
    }
    return `${scope}/${name}`
  }

  return segments[0] ?? null
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          const packageName = getPackageName(id)
          if (!packageName) {
            return undefined
          }

          if (REACT_PACKAGES.has(packageName)) {
            return 'vendor-react'
          }

          if (QUERY_PACKAGES.has(packageName)) {
            return 'vendor-query'
          }

          if (FORM_PACKAGES.has(packageName)) {
            return 'vendor-form'
          }

          if (STATE_PACKAGES.has(packageName)) {
            return 'vendor-state'
          }

          if (CHART_PACKAGES.has(packageName) || packageName.startsWith('d3-')) {
            return 'vendor-charts'
          }

          if (packageName === 'dayjs') {
            return 'vendor-dayjs'
          }

          return 'vendor-misc'
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
