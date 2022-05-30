import { useResizeObserver } from "../useResizeObserver"
import { act, fireEvent, render, renderHook } from "@testing-library/react"
import React from "react"
import { disconnect } from "process"

let mockObserve = jest.fn()
let mockDisconnect = jest.fn()
let mockUnobserve = jest.fn()

class ResizeObserver {
  observe() {
    mockObserve()
  }
  unobserve() {
    mockUnobserve()
  }
  disconnect() {
    mockDisconnect()
  }
}

window.ResizeObserver = ResizeObserver

const MockComponent = () => {
  const result = useResizeObserver<HTMLDivElement>()
  return (
    <div>
      <div ref={result.observer}>Mock</div>
      <button onClick={result.disconnect}>Disconnect</button>
    </div>
  )
}

beforeEach(() => {
  jest.clearAllMocks()
})

it("does not throw", () => {
  expect(() => <MockComponent />).not.toThrow()
})

it("observes the registered DOM element", () => {
  render(<MockComponent />)
  expect(mockObserve).toHaveBeenCalledTimes(1)
})

it("disconnects when callback invoked", () => {
  const { getByText, rerender } = render(<MockComponent />)

  // The disconnect callback implementation uses a ref. rerender to get the next update.
  rerender(<MockComponent />)

  fireEvent.click(getByText("Disconnect"))

  expect(mockDisconnect).toHaveBeenCalledTimes(1)
})

it("disconnects on unmount", () => {
  const { unmount } = render(<MockComponent />)

  unmount()

  expect(mockDisconnect).toHaveBeenCalledTimes(1)
})

it("unobserves on unmount", () => {
  const { unmount } = render(<MockComponent />)

  unmount()

  expect(mockUnobserve).toHaveBeenCalledTimes(1)
})

it("returns the entry from the observer callback", () => {
  let observerCallback: ResizeObserverCallback = () => {}

  class ResizeObserver {
    constructor(callback: ResizeObserverCallback) {
      observerCallback = callback
    }
    observe() {}
    disconnect() {}
    unobserve() {}
  }

  window.ResizeObserver = ResizeObserver

  const { result } = renderHook(() => useResizeObserver())

  act(() => {
    const el = document.createElement("div")
    result.current.observer(el)
  })

  act(() => {
    observerCallback([{ test: "test" } as any], new ResizeObserver(observerCallback))
  })

  expect(result.current.entry).toEqual({ test: "test" })
})

it("calls onResize callback if there are entries", () => {
  let observerCallback: ResizeObserverCallback = () => {}

  class ResizeObserver {
    constructor(callback: ResizeObserverCallback) {
      observerCallback = callback
    }
    observe() {}
    disconnect() {}
    unobserve() {}
  }

  window.ResizeObserver = ResizeObserver

  const mockOnResize = jest.fn()
  const { result } = renderHook(() => useResizeObserver(mockOnResize))

  act(() => {
    const el = document.createElement("div")
    result.current.observer(el)
  })

  act(() => {
    observerCallback([{ test: "test" } as any], new ResizeObserver(observerCallback))
  })

  expect(mockOnResize).toHaveBeenCalledTimes(1)
})

it("returns a null entry and does not call onResize if no rentries were called back", () => {
  let observerCallback: ResizeObserverCallback = () => {}

  class ResizeObserver {
    constructor(callback: ResizeObserverCallback) {
      observerCallback = callback
    }
    observe() {}
    disconnect() {}
    unobserve() {}
  }

  window.ResizeObserver = ResizeObserver

  const mockOnResize = jest.fn()
  const { result } = renderHook(() => useResizeObserver(mockOnResize))

  act(() => {
    const el = document.createElement("div")
    result.current.observer(el)
  })

  act(() => {
    observerCallback([], new ResizeObserver(observerCallback))
  })

  expect(result.current.entry).toBeNull()
  expect(mockOnResize).not.toHaveBeenCalled()
})
