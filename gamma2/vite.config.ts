import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      preserveEntrySignatures: false,
      output: {
        strictExecutionOrder: true,
        codeSplitting: {
          // Preserve the lazy scene boundary instead of pulling shared React
          // dependencies recursively into the WebGL chunks.
          includeDependenciesRecursively: false,
          groups: [
            { name: 'three-core', test: /node_modules[\\/]three[\\/]build[\\/]three\.core/, priority: 3 },
            { name: 'three-renderer', test: /node_modules[\\/]three[\\/]/, priority: 2 },
            { name: 'three-scene', test: /node_modules[\\/](@react-three|@pmndrs|three-stdlib)/, priority: 1 },
          ],
        },
      },
    },
  },
})
