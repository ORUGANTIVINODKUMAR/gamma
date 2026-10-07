type ClassValue = string | number | false | null | undefined | ClassValue[] | Record<string, boolean | undefined>

/** Tiny className combiner (clsx-compatible subset). */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = []
  const walk = (value: ClassValue) => {
    if (!value) return
    if (typeof value === 'string' || typeof value === 'number') {
      out.push(String(value))
    } else if (Array.isArray(value)) {
      value.forEach(walk)
    } else {
      for (const key in value) if (value[key]) out.push(key)
    }
  }
  inputs.forEach(walk)
  return out.join(' ')
}

/** Adds `relative` unless the caller already positions the element (absolute / fixed / sticky / relative). */
export function withPosition(className?: string): string {
  return className && /(^|\s)(absolute|fixed|sticky|relative)(\s|$)/.test(className) ? className : cn('relative', className)
}
