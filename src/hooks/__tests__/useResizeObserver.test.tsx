import { useResizeObserver } from "../useResizeObserver"
import { act, fireEvent, render, waitFor } from "@testing-library/react"
import React, { useRef } from "react"

let mockObserve = jest.fn()
let mockDisconnect = jest.fn()
let mockUnobserve = jest.fn()
let mockOnResize = jest.fn((el: HTMLDivElement | null) => el)

let mockObserverCallback = jest.fn(
  (entries: ResizeObserverEntry[], observer: ResizeObserver) => {
    return entries
  }
)

class ResizeObserver {
  constructor(callback: any) {
    mockObserverCallback = callback
  }

  observe(target: Element) {
    mockObserve(target)
  }
  unobserve(target: Element, options?: ResizeObserverOptions) {
    mockUnobserve(target, options)
  }
  disconnect(): void {
    mockDisconnect()
  }
}

window.ResizeObserver = ResizeObserver

const MockComponent = (props: { elementRef?: boolean | null }) => {
  const elRef = useRef<HTMLDivElement | null>(null)

  const result = useResizeObserver<HTMLDivElement | null>({
    elementRef: props.elementRef === true ? elRef : undefined,
    onResize: el => {
      mockOnResize(el)
    }
  })

  if (props.elementRef === null) return <div>Mock</div>

  return (
    <div>
      <div ref={props.elementRef === true ? elRef : result.observe}>Mock</div>
      <button
        onClick={() => {
          if (result.disconnect) result.disconnect()
          if (result.unobserve) result.unobserve()
        }}
      >
        Disconnect
      </button>
      {result.entry?.contentBoxSize && (
        <div>
          <div>Entry</div>
          <div>{result.entry.contentBoxSize[0].blockSize}</div>
          <div>{result.entry.contentBoxSize[0].inlineSize}</div>
        </div>
      )}
    </div>
  )
}

beforeEach(() => {
  jest.clearAllMocks()
})

it("does not throw", () => {
  expect(() => <MockComponent />).not.toThrow()
})

it("does nothing without an element", () => {
  const { rerender } = render(<MockComponent elementRef={null} />)
  expect(mockUnobserve).not.toHaveBeenCalled()
  expect(mockDisconnect).not.toHaveBeenCalled()
  expect(mockObserve).not.toHaveBeenCalled()
})

it("does not render an entry if none returned", () => {
  const { rerender, getByText } = render(<MockComponent />)
  act(() => {
    mockObserverCallback([], new ResizeObserver(mockObserverCallback))
  })

  rerender(<MockComponent />)

  expect(() => getByText("Entry")).toThrow()
})

it("observes the DOM element passed into the observer callback.", () => {
  const { rerender, getByText } = render(<MockComponent />)

  // Pretend a user has resized the element, calling the observer.
  act(() => {
    mockObserverCallback(
      // Add a new entry
      [
        {
          contentBoxSize: [{ inlineSize: 500, blockSize: 900 }],
          borderBoxSize: [],
          contentRect: {}
        } as any
      ],
      new ResizeObserver(mockObserverCallback)
    )
  })

  rerender(<MockComponent />)

  expect(mockObserve).toHaveBeenCalledTimes(1)

  // The observe callback was called on the dom ref attribute.
  expect(mockObserve).toHaveBeenCalledWith(expect.any(Element))

  expect(() => getByText("500")).not.toThrow()
  expect(() => getByText("900")).not.toThrow()
})

it("observes the DOM element reference passed as a parameter.", () => {
  const elRef = { current: document.createElement("div") }
  const { rerender, getByText } = render(<MockComponent elementRef={true} />)

  // Pretend a user has resized the element, calling the observer.
  act(() => {
    mockObserverCallback(
      // Add a new entry
      [
        {
          contentBoxSize: [{ inlineSize: 500, blockSize: 900 }],
          borderBoxSize: [],
          contentRect: {}
        } as any
      ],
      new ResizeObserver(mockObserverCallback)
    )
  })

  rerender(<MockComponent elementRef={true} />)

  expect(mockObserve).toHaveBeenCalledTimes(1)

  // An element was passed directly into the hook and is using that ref.
  expect(mockObserve).toHaveBeenCalledWith(expect.any(Element))

  expect(() => getByText("500")).not.toThrow()
  expect(() => getByText("900")).not.toThrow()
})

it("calls disconnect and unobserve onClick", () => {
  const { getByText, rerender } = render(<MockComponent />)

  rerender(<MockComponent />)

  fireEvent.click(getByText("Disconnect"))

  expect(mockUnobserve).toHaveBeenCalledTimes(1)
  expect(mockDisconnect).toHaveBeenCalledTimes(1)
})

it("disconnects on unmount", () => {
  const { unmount } = render(<MockComponent />)

  expect(mockDisconnect).toHaveBeenCalledTimes(0)

  unmount()

  expect(mockDisconnect).toHaveBeenCalledTimes(1)
})

it("unobserves on unmount", () => {
  const { unmount } = render(<MockComponent />)

  expect(mockUnobserve).toHaveBeenCalledTimes(0)

  unmount()

  expect(mockUnobserve).toHaveBeenCalledTimes(1)
})

it("calls onResize with the element", () => {
  render(<MockComponent />)

  expect(mockOnResize).toHaveBeenCalledTimes(1)

  expect(mockOnResize).toHaveBeenCalledWith(expect.any(HTMLDivElement))
})
