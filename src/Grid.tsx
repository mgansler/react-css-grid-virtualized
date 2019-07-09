import * as React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
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

interface Dimensions {
  rows: number
  columns: number
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

interface ScrollContainerProps {
  itemCount: number
  onScroll: () => void
}

const ScrollContainer: React.FC<ScrollContainerProps> = ({ children, itemCount, onScroll }) => <div
  style={{ overflowY: itemCount > 0 ? "scroll" : "hidden", maxHeight: "100%" }}
  onScroll={debounce(onScroll, 50)}>{children}</div>

interface GridState {
  visibleItems: number[]
  rows: number
  columns: number
}

export const Grid = <T extends {}>({ className, items, Item, minItemWidth = 400, minItemHeight = 400, gridGap = 0, padding = 0 }: GridProps<T>) => {
  const gridRef = useRef<HTMLDivElement>(null)

  // Do not render any items on the first iteration
  const [dimensions, setDimensions] = useState<Dimensions>({ rows: 0, columns: 0 })
  const [visibleItems, setVisibleItems] = useState<number[]>([])

  const updateVisibleItems = useCallback(() => {
    if (gridRef.current !== null) {
      const { parentElement, scrollHeight } = gridRef.current

      // Our row height is the height of an item plus a grid gap
      const rowHeightWithGap = ((scrollHeight + gridGap - 2 * padding) / dimensions.rows)

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
        firstVisibleRow * dimensions.columns,
        Math.min(lastVisibleRow * dimensions.columns + dimensions.columns, items.length),
      )

      // Avoid re-rendering when items do not change
      if (!areVisibleItemsEqual(visibleItems, newVisibleItems)) {
        setVisibleItems(newVisibleItems)
      }
    }
  }, [dimensions.rows, dimensions.columns, items.length, padding, gridGap, visibleItems])

  const updateDimensions = useCallback(() => {
    if (gridRef.current !== null) {
      // CSS Grid auto-fit puts as many items in a single row as long as they can be wider than the minimal item width.
      // It uses the exact value of the grid to calculate that. (gridRef.current.clientWidth is rounded)
      // We add an additional virtual gap to the width so we can divide by (minItemWidth + gridGap).
      const columnCount = Math.floor((gridRef.current.getBoundingClientRect().width + gridGap - 2 * padding) / (minItemWidth + gridGap))

      setDimensions({
        rows: Math.ceil(items.length / columnCount),
        columns: columnCount,
      })
    }
    updateVisibleItems()
  }, [items.length, minItemWidth, padding, gridGap, updateVisibleItems])

  useEffect(() => {
    window.addEventListener("resize", updateDimensions)
    updateDimensions()

    return () => {
      window.removeEventListener("resize", updateDimensions)
    }
  }, [items.length, minItemWidth, gridGap, padding, updateVisibleItems, updateDimensions])

  return (
    <ScrollContainer itemCount={items.length} onScroll={updateVisibleItems}>
      <div
        ref={gridRef}
        className={className}
        style={{
          display: "grid",
          gridTemplateRows: `repeat(${dimensions.rows}, minmax(${minItemHeight}px, 1fr)`,
          gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}px, 1fr)`,
          gap: `${gridGap}px ${gridGap}px`,
          padding,
        }}
      >
        {visibleItems.map(id => items[id] ? <Item
          {...items[id]}
          key={id}
          gridColumnStart={1 + id % dimensions.columns}
          gridRowStart={1 + Math.floor(id / dimensions.columns)}
        /> : null)}
      </ div>
    </ ScrollContainer>
  )
}
