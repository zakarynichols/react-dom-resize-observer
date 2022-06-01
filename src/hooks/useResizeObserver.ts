import React, { useCallback, useEffect, useRef } from "react"

export function useResizeObserver<T extends Element | null>(
  elementRef?: React.MutableRefObject<T>,
  onResize?: (entry: ResizeObserverEntry) => void
): {
  entry: ResizeObserverEntry | null
  observer: (el: T) => void
  disconnect: () => void
} {
  const resizeObserver = useRef<ResizeObserver | null>(null)
  const observerEntry = useRef<ResizeObserverEntry | null>(null)
  const disconnect = useRef(() => {
    /** Initialized as a no-op */
  })
  const unobserve = useRef(() => {
    /** Initialized as a no-op */
  })

  /** Callback with the same signature as an elements `ref` attribute. */
  const observer = useCallback(
    (el: T) => {
      if (el === null) return
      resizeObserver.current = new ResizeObserver(entries => {
        if (entries.length === 0) return

        observerEntry.current = entries[0]

        if (onResize) {
          onResize(entries[0])
        }
      })

      resizeObserver.current.observe(el)

      disconnect.current = (): void => {
        resizeObserver.current?.disconnect()
      }

      unobserve.current = (): void => {
        resizeObserver.current?.unobserve(el)
      }
    },
    [onResize]
  )

  /** If they have provided a ref of their own, set it the observer here. */
  useEffect(() => {
    if (elementRef?.current === undefined || elementRef.current === null) return
    observer(elementRef.current)
  }, [observer, elementRef])

  /** Unobserve and disconnect when unmounted. */
  useEffect(() => {
    return () => {
      unobserve.current()
      disconnect.current()
    }
  }, [])

  return {
    entry: observerEntry.current,
    observer,
    disconnect: disconnect.current
  }
}
