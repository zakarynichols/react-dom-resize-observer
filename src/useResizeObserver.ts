import { useCallback, useEffect, useRef, useState } from "react"

export function useResizeObserver<T extends Element | null>(
  onResize?: (entry: T) => void
): {
  entry: ResizeObserverEntry | null
  observer: (el: T) => void
  disconnect: () => void
} {
  const [entry, setEntry] = useState<ResizeObserverEntry | null>(null)
  const [el, setEl] = useState<T | null>(null)

  const observer = useCallback((el: T) => {
    setEl(el)
  }, [])

  const disconnect = useRef(() => {
    /** */
  })

  useEffect(() => {
    if (el === null) return
    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length === 0) return

      const entry = entries[0]

      setEntry(entry)

      if (onResize) {
        onResize(el)
      }
    })

    resizeObserver.observe(el)

    disconnect.current = (): void => {
      resizeObserver.disconnect()
    }

    return () => {
      resizeObserver.unobserve(el)
      resizeObserver.disconnect()
    }
  }, [el, onResize])

  return {
    entry,
    observer,
    disconnect: disconnect.current
  }
}
