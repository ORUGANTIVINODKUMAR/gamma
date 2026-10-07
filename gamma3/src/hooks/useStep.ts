import { useEffect, useState } from 'react'

/**
 * Counts 0, 1, 2 ... while `active`, one tick per `ms`. Resets to 0 whenever it becomes inactive,
 * so a scene replays from the start each time it is shown. With `period` the count wraps (looping demos).
 */
export function useStep(active: boolean, period?: number, ms = 700): number {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!active) {
      setN(0)
      return
    }
    const id = window.setInterval(() => {
      if (!document.hidden) setN((v) => v + 1)
    }, ms)
    return () => window.clearInterval(id)
  }, [active, ms])
  return period ? n % period : n
}
