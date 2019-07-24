import * as React from "react"
import { useEffect, useReducer, useRef } from "react"
import { Action, GridAction, GridProps, GridState, RenderState } from "./types"
import { ScrollContainer } from "./ScrollContainer"
import { isUpdateRequired } from "./isUpdateRequired"
import { range } from "./utils"

export const GridFc = <T extends {}>({ className, items, Item, minItemWidth = 400, minItemHeight = 400, gridGap = 0, padding = 0, preload = 0 }: GridProps<T>) => {
  const gridRef = useRef<HTMLDivElement>(null)
  const renderState = useRef<RenderState>(RenderState.Initial)

  function reduceGridState(state: GridState, action: GridAction): GridState {
    // We want at least one column, even if the parent is narrower than the minItemWidth
    const columnCount = Math.max(Math.floor((gridRef.current!.getBoundingClientRect().width + gridGap - 2 * padding) / (minItemWidth + gridGap)), 1)
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
  }

  const [gridState, dispatchGridState] = useReducer(reduceGridState, {
    // Initially we do not render any items
    rows: 0,
    columns: 0,
    visibleItems: [],
  })

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
    if (renderState.current === RenderState.Continuous) {
      dispatchGridState({ type: Action.PropsUpdate })
    }
  }, [gridGap, items.length, minItemWidth, padding, className, preload])

  useEffect(() => {
    window.addEventListener(Action.Resize, dispatchGridState as EventListener)
    return () => {
      window.removeEventListener(Action.Resize, dispatchGridState as EventListener)
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
