# React Resize Observer

Hook to provide a performant mechanism by which code can monitor an element for changes to its size, with notifications being delivered to the observer each time the size changes.

[![codecov](https://codecov.io/gh/zaknicholsdev/react-dom-resize-observer/branch/develop/graph/badge.svg)](https://codecov.io/gh/zaknicholsdev/react-dom-resize-observer)

![Workflow](https://github.com/zaknicholsdev/react-dom-resize-observer/actions/workflows/ci-cd.yml/badge.svg?branch=develop)


### Installation

```sh
$ npm install react-dom-resize-observer
```

### Examples

```tsx
export function App() {
  // Pass a callback to be fired on resize event. 
  // Wrap in `useCallback` or in module scope for referential stability.
  const onResize = useCallback((entry: ResizeObserverEntry & { target: HTMLDivElement }) => {
    if (entry === null) return
    // Do something with the entry...
  }, [])

  /*
   * Pass the element type you're going to attach the observer to. In this case, `HTMLDivElement`.
   * This generic type parameter helps infer the correct typing for `onResize` and `observer`.
   */
  const {
      // New dimensions when resize is observed.
      entry, 
      // Callback to pass as a ref to give this hook access to the DOM element.
      observer, 
      // Callback to disconnect observing completely.
      disconnect 
      // `onResize` can be used to get access to the raw DOM element when resizing occurs.
      // Can be used to perform some imperative updates or other logic on element resize event.
    } = useResizeObserver<HTMLDivElement>(onResize)

  return (
    // Attach the observer as a ref to the DOM. 
    <div ref={observer} onClick={disconnect}>
      App
    </div>
  )
}
```
