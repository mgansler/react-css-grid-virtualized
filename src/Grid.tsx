import * as React from "react"
import { Dispatch, useCallback, useEffect, useReducer, useRef } from "react"
import { debounce, range } from "lodash"

export interface GridPosition {
  gridRowStart: number
  gridColumnStart: number
}

interface GridProps<T> {
  className?: string
  gridGap?: number
  Item: React.FC<T & GridPosition>
  items: T[]
  minItemHeight?: number
  minItemWidth?: number
  padding?: number
  preload?: number
}

interface ScrollContainerProps {
  itemCount: number
  onScroll: Dispatch<GridAction>
}

enum Action {
  Initial = "initial",
  Secondary = "secondary",
  PropsUpdate = "props updated",
  Resize = "resize",
  Scroll = "scroll",
}

const ScrollContainer: React.FC<ScrollContainerProps> = ({ children, itemCount, onScroll }) => <div
  style={{ overflowY: itemCount > 0 ? "scroll" : "hidden", height: "100%" }}
  onScroll={debounce(() => onScroll({ type: Action.Scroll }), 50)}>{children}</div>

enum RenderState {
  Initial,
  SingleRow,
  Continuous,
}

interface GridState {
  visibleItems: number[]
  rows: number
  columns: number
}

interface GridAction {
  type: Action
}

// Compares the first and last element of the given arrays
const areVisibleItemsEqual = (lastVisibleItems: number[], newVisibleItems: number[]) => {
  if (lastVisibleItems.length !== newVisibleItems.length) {
    return false
  }
  const length = lastVisibleItems.length

  if (length === 0) {
    // both empty
    return true
  }

  return lastVisibleItems[0] === newVisibleItems[0] && lastVisibleItems[length - 1] === newVisibleItems[length - 1]
}

const isUpdateRequired = (oldGridState: GridState, newGridState: GridState): boolean => {
  const { rows: currentRows, columns: currentColumns, visibleItems: currentVisibleItems } = oldGridState
  const { rows: newRows, columns: newColumns, visibleItems: newVisibleItems } = newGridState

  return currentColumns !== newColumns || currentRows !== newRows || !areVisibleItemsEqual(currentVisibleItems, newVisibleItems)
}

export const Grid = <T extends {}>({ className, items, Item, minItemWidth = 400, minItemHeight = 400, gridGap = 0, padding = 0, preload = 0 }: GridProps<T>) => {
  const gridRef = useRef<HTMLDivElement>(null)
  const renderState = useRef<RenderState>(RenderState.Initial)

  const reduceGridState = useCallback((state: GridState, action: GridAction): GridState => {
    const columnCount = Math.floor((gridRef.current!.getBoundingClientRect().width + gridGap - 2 * padding) / (minItemWidth + gridGap))
    const rowCount = Math.ceil(items.length / columnCount)

    // After the initial render we add a single row so we know the height of the grid during the next render
    if (action.type === Action.Initial) {
      renderState.current = RenderState.SingleRow
      return {
        rows: rowCount,
        columns: columnCount,
        visibleItems: range(0, Math.min(columnCount, items.length)),
      }
    }

    const { parentElement, scrollHeight } = gridRef.current!

    // Our row height is the height of an item plus a grid gap
    const rowHeightWithGap = ((scrollHeight + gridGap - 2 * padding) / state.rows)

    // For the first visible row we are interested when the lower boundary of an item enters/leaves the screen.
    let firstVisibleRow = Math.max(Math.floor((parentElement!.scrollTop + gridGap - padding) / rowHeightWithGap - preload), 0)
    // For the last visible row we are interested when the upper boundary of an item enters/leaves the screen.
    const lastVisibleRow = Math.floor((parentElement!.scrollTop + parentElement!.getBoundingClientRect().height - padding) / rowHeightWithGap + preload)

    // If only a single row fit's the screen we also render the row above
    // to avoid jumping that might occur when the last (total) row contains fewer items that would fit.
    // Otherwise, these items would appear stretched.
    if (firstVisibleRow === lastVisibleRow && firstVisibleRow > 0) {
      firstVisibleRow--
    }

    const newVisibleItems = range(
      firstVisibleRow * columnCount,
      Math.min(lastVisibleRow * columnCount + columnCount, items.length),
    )

    const newState: GridState = {
      rows: rowCount,
      columns: columnCount,
      visibleItems: newVisibleItems,
    }

    renderState.current = RenderState.Continuous
    return isUpdateRequired(state, newState) ? newState : state

  }, [gridGap, items.length, minItemWidth, padding, preload])

  const [gridState, dispatchGridState] = useReducer(reduceGridState, {
    rows: 0,
    columns: 0,
    visibleItems: [],
  })

  useEffect(() => {
    if (renderState.current === RenderState.Continuous) {
      dispatchGridState({ type: Action.PropsUpdate })
    }
  }, [gridGap, items.length, minItemWidth, padding, className, preload])

  useEffect(() => {
    // Use switch to ensure only one action is dispatched
    switch (renderState.current) {
      case RenderState.Initial:
        dispatchGridState({ type: Action.Initial })
        break
      case RenderState.SingleRow:
        dispatchGridState({ type: Action.Secondary })
        break
    }
  })

  useEffect(() => {
    // @ts-ignore
    window.addEventListener(Action.Resize, dispatchGridState)
    return () => {
      // @ts-ignore
      window.removeEventListener(Action.Resize, dispatchGridState)
    }
  }, [])

  return (
    <ScrollContainer itemCount={items.length} onScroll={dispatchGridState}>
      <div
        ref={gridRef}
        className={className}
        style={{
          display: "grid",
          gridTemplateRows: `repeat(${gridState.rows}, minmax(${minItemHeight}px, 1fr)`,
          gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}px, 1fr)`,
          gap: `${gridGap}px ${gridGap}px`,
          padding,
        }}
      >
        {gridState.visibleItems.map(id => items[id] ? <Item
          {...items[id]}
          key={id}
          gridColumnStart={1 + id % gridState.columns}
          gridRowStart={1 + Math.floor(id / gridState.columns)}
        /> : null)}
      </ div>
    </ ScrollContainer>
  )
}
