import React, { useCallback, useEffect, useRef } from "react"

/**
 * useResizeObserver is an abstraction to subscribe an element to the ResizeObserver API.
 * This hook internally uses only `useRef` and will not trigger a re-render.
 */
export function useResizeObserver<T extends Element | null>(params?: {
  elementRef?: React.MutableRefObject<T>
  onResize?: (el: T) => void
}): {
  entry: ResizeObserverEntry | null
  observe: (el: T) => void
  disconnect?: (() => void) | null
  unobserve?: (() => void) | null
} {
  /** A local element reference to set if they did not pass one. */
  const currentElement = useRef<T | null>(null)
  /** The resize observer instance */
  const resizeObserver = useRef<ResizeObserver | null>(null)
  /** The actual observer entry returned on resize. */
  const observerEntry = useRef<ResizeObserverEntry | null>(null)
  /** Ref to close over the disconnect. */
  const disconnect = useRef<(() => void) | null>(null)
  /** Ref to close over the unobserve and its element. */
  const unobserve = useRef<(() => void) | null>(null)

  /** If they pass their own ref, set it to the current element */
  useEffect(() => {
    if (
      params?.elementRef?.current !== undefined &&
      params.elementRef.current !== null
    )
      currentElement.current = params.elementRef.current
  }, [params?.elementRef])

  /** Callback with the same signature as an elements `ref` attribute. */
  const observe = useCallback((el: T) => {
    if (el === null) return
    currentElement.current = el
  }, [])

  useEffect(() => {
    const el = currentElement.current

    if (el === null) return

    const resize = (resizeObserver.current = new ResizeObserver(entries => {
      if (entries.length === 0) return
      observerEntry.current = entries[0]
    }))

    resize.observe(el)

    disconnect.current = (): void => {
      resize.disconnect()
    }

    unobserve.current = (): void => {
      resize.unobserve(el)
    }

    return () => {
      resize.disconnect()
      resize.unobserve(el)
    }
  }, [])

  useEffect(() => {
    if (currentElement.current && params?.onResize)
      params.onResize(currentElement.current)
  }, [params])

  return {
    entry: observerEntry.current,
    observe,
    disconnect: disconnect.current,
    unobserve: unobserve.current
  }
}
