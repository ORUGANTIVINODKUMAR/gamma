import { useEffect } from 'react'

export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title ? `${title} · Tapreco` : 'Tapreco — Tax Technology for Modern Tax Professionals'
  }, [title])
}
