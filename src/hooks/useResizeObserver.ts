import { useCallback, useEffect, useRef, useState } from "react"

export function useResizeObserver<T extends Element>(
  onResize?: (entry: ResizeObserverEntry & { target: T }) => void
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
      const newEntry: ResizeObserverEntry & { target: T } = { ...entry, target: el }

      setEntry(newEntry)

      if (onResize) {
        onResize(newEntry)
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
