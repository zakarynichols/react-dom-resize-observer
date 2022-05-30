import { useResizeObserver } from "../useResizeObserver"
import { fireEvent, render, waitFor } from "@testing-library/react"
import React from "react"

let mockObserve = jest.fn()
let mockDisconnect = jest.fn()
let mockUnobserve = jest.fn()

class ResizeObserver {
  callback: ResizeObserverCallback

  constructor(callback: ResizeObserverCallback) {
    this.callback = function (entries: ResizeObserverEntry[]) {
      console.log(entries)
    }
  }

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
