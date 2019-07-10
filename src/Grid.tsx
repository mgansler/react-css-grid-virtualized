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
  onScroll={debounce(() => {
    onScroll({ type: Action.Scroll })
  }, 50)}>{children}</div>

enum RenderState {
  Initial,
  SingleRow,
  Continuous,
}

interface GridState {
  visibleItems: number[]
  rows: number
  columns: number
  renderState: RenderState
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

export const Grid = <T extends {}>({ className, items, Item, minItemWidth = 400, minItemHeight = 400, gridGap = 0, padding = 0 }: GridProps<T>) => {
  const gridRef = useRef<HTMLDivElement>(null)

  const reduceGridState = useCallback((state: GridState, action: GridAction): GridState => {
    console.log("reducer", action.type, state)

    const columnCount = Math.floor((gridRef.current!.getBoundingClientRect().width + gridGap - 2 * padding) / (minItemWidth + gridGap))
    const rowCount = Math.ceil(items.length / columnCount)

    if (action.type === Action.Initial) {
      return {
        rows: rowCount,
        columns: columnCount,
        visibleItems: range(0, Math.min(columnCount, items.length)),
        renderState: RenderState.SingleRow,
      }
    }

    const { parentElement, scrollHeight } = gridRef.current!

    // Our row height is the height of an item plus a grid gap
    const rowHeightWithGap = ((scrollHeight + gridGap - 2 * padding) / state.rows)

    // For the first visible row we are interested when the lower boundary of an item enters/leaves the screen.
    let firstVisibleRow = Math.max(Math.floor((parentElement!.scrollTop + gridGap - padding) / rowHeightWithGap), 0)
    // For the last visible row we are interested when the upper boundary of an item enters/leaves the screen.
    const lastVisibleRow = Math.floor((parentElement!.scrollTop + parentElement!.getBoundingClientRect().height - padding) / rowHeightWithGap)

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
      renderState: RenderState.Continuous,
    }

    return isUpdateRequired(state, newState) ? newState : state

  }, [gridGap, items.length, minItemWidth, padding])

  const [gridState, setGridState] = useReducer(reduceGridState, {
    rows: 0,
    columns: 0,
    visibleItems: [],
    renderState: RenderState.Initial,
  })

  useEffect(() => {
    if (gridState.renderState === RenderState.Continuous) {
      setGridState({ type: Action.PropsUpdate })
    }
  }, [gridGap, items.length, minItemWidth, padding])

  useEffect(() => {
    if (gridState.renderState === RenderState.Initial) {
      setGridState({ type: Action.Initial })
    }
    if (gridState.renderState === RenderState.SingleRow) {
      setGridState({ type: Action.Secondary })
    }
  }, [gridState.renderState])

  useEffect(() => {
    // @ts-ignore
    window.addEventListener("resize", setGridState)
    return () => {
      // @ts-ignore
      window.removeEventListener("resize", setGridState)
    }
  }, [])

  console.log("render", gridState)

  return (
    <ScrollContainer itemCount={items.length} onScroll={setGridState}>
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
