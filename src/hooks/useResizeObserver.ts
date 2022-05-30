import { useCallback, useEffect, useRef, useState } from "react"

type ResizeEntry<T> = {
  contentBoxSize: { inlineSize: number; blockSize: number }
  contentRect: {
    bottom: number
    height: number
    left: number
    right: number
    top: number
    width: number
    x: number
    y: number
  }
  target: T
}

export function useResizeObserver<T extends Element>(
  onResize?: (entry: ResizeEntry<T> & { target: T }) => void
): {
  entry: ResizeEntry<T> | null
  observer: (el: T) => void
  disconnect: () => void
} {
  const [entry, setEntry] = useState<ResizeEntry<T> | null>(null)
  const [el, setEl] = useState<T | null>(null)

  const observer = useCallback((el: T) => {
    setEl(el)
  }, [])

  const disconnect = useRef(() => {
    /** */
  })

  const cb = useCallback((entry: ResizeEntry<T> | null) => {
    setEntry(entry)
  }, [])

  useEffect(() => {
    if (el === null) return
    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length === 0) return

      const {
        contentBoxSize: [contentBoxSize],
        contentRect
      } = entries[0]

      cb({
        contentBoxSize: {
          inlineSize: contentBoxSize.inlineSize,
          blockSize: contentBoxSize.blockSize
        },
        contentRect: {
          bottom: contentRect.bottom,
          height: contentRect.height,
          left: contentRect.left,
          right: contentRect.right,
          top: contentRect.top,
          width: contentRect.width,
          x: contentRect.x,
          y: contentRect.y
        },
        target: el
      })

      if (onResize) {
        onResize({
          contentBoxSize: {
            inlineSize: contentBoxSize.inlineSize,
            blockSize: contentBoxSize.blockSize
          },
          contentRect: {
            bottom: contentRect.bottom,
            height: contentRect.height,
            left: contentRect.left,
            right: contentRect.right,
            top: contentRect.top,
            width: contentRect.width,
            x: contentRect.x,
            y: contentRect.y
          },
          target: el
        })
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
  }, [el, onResize, cb])

  return {
    entry,
    observer,
    disconnect: disconnect.current
  }
}
