import '@fontsource-variable/manrope'
import '@fontsource-variable/inter'
import '@fontsource/instrument-serif/latin-400.css'
import '@fontsource/instrument-serif/latin-400-italic.css'
import './styles/index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AuthProvider } from '@/context/AuthContext'
import { PreferencesProvider } from '@/context/PreferencesContext'
import App from './App'

function CrashScreen() {
  return (
    <div className="grid min-h-dvh place-items-center bg-ink-950 px-6 text-center">
      <div>
        <p className="eyebrow">Something went wrong</p>
        <h1 className="mt-4 font-display text-3xl font-semibold text-fg">Tapreco hit an unexpected error.</h1>
        <p className="mt-3 text-fg-subtle">Your saved work is safe. Reload to continue.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-8 rounded-full bg-accent-400 px-6 py-3 text-sm font-semibold text-white"
        >
          Reload Tapreco
        </button>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallback={<CrashScreen />}>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
        <PreferencesProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </PreferencesProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
