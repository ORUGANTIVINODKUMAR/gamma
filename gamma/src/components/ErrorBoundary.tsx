import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Rendered instead of children after an error. `null` renders nothing. */
  fallback: ReactNode | ((reset: () => void) => ReactNode)
  onError?: (error: Error) => void
}

export class ErrorBoundary extends Component<Props, { error: Error | null }> {
  state: { error: Error | null } = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error)
    if (import.meta.env.DEV) console.warn('[Tapreco] Recovered from render error:', error, info.componentStack)
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      const { fallback } = this.props
      return typeof fallback === 'function' ? fallback(this.reset) : fallback
    }
    return this.props.children
  }
}
