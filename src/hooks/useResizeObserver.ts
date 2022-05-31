import { useCallback, useEffect, useRef } from "react"

export function useResizeObserver<T extends Element | null>(
  ref?: React.MutableRefObject<T>,
  onResize?: (entry: ResizeObserverEntry) => void
): {
  entry: ResizeObserverEntry | null
  observer: (el: T) => void
  disconnect?: () => void
} {
  const resizeObserver = useRef<ResizeObserver | null>(null)
  const observerEntry = useRef<ResizeObserverEntry | null>(null)
  const disconnect = useRef(() => {
    /** */
  })
  const unobserve = useRef(() => {
    /** */
  })
  /** Set when */
  const isElementObserved = useRef(false)

  /** Pass a callback to set the observed element. */
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

      isElementObserved.current = true

      disconnect.current = (): void => {
        resizeObserver.current?.disconnect()
      }

      unobserve.current = (): void => {
        resizeObserver.current?.unobserve(el)
      }
    },
    [onResize]
  )

  /** Set the element reference as a side-effect if supplied. */
  useEffect(() => {
    if (
      ref?.current === undefined ||
      ref.current === null ||
      isElementObserved.current === true
    )
      return
    observer(ref.current)
  }, [observer, ref])

  /** If there is an element reference passed in, set to true to prevent observer callback running twice. */
  useEffect(() => {
    if (ref?.current === undefined || ref.current === null) return
    isElementObserved.current = true
  }, [ref])

  /** Unobserve and disconnect when unmounted. */
  useEffect(
    () => () => {
      unobserve.current()
      disconnect.current()
    },
    []
  )

  return {
    entry: observerEntry.current,
    observer,
    disconnect: disconnect.current
  }
}
