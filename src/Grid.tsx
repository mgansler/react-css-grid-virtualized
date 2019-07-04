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

export const Grid = <T extends {}>({ className, items, Item, minItemWidth = 400, minItemHeight = 400, gridGap = 0, padding = 0 }: GridProps<T>) => {
  const gridRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState<Dimensions>({ rows: items.length, columns: 1 })
  const [visibleItems, setVisibleItems] = useState<number[]>([])

  const handleResize = useCallback(() => {
    if (gridRef.current !== null && items.length > 0) {
      const columnCount = Math.floor((gridRef.current.clientWidth - 2 * padding + gridGap) / (minItemWidth + gridGap))
      setDimensions({
        rows: Math.ceil(items.length / columnCount),
        columns: columnCount,
      })
    }
  }, [items.length, minItemWidth, padding, gridGap])

  const handleScroll = useCallback(() => {
    if (gridRef.current !== null && items.length > 0) {
      const { parentElement, scrollHeight } = gridRef.current

      const rowHeight = ((scrollHeight - 2 * padding + gridGap) / dimensions.rows)

      let firstRow = Math.floor((parentElement!.scrollTop - padding + gridGap) / rowHeight)
      const lastRow = Math.floor((parentElement!.scrollTop - padding + parentElement!.clientHeight) / rowHeight)

      if (firstRow === lastRow && firstRow > 0) {
        firstRow--
      }

      const newVisibleItems = range(firstRow * dimensions.columns, Math.min(lastRow * dimensions.columns + dimensions.columns, items.length))

      setVisibleItems(newVisibleItems)
    }
  }, [dimensions.rows, dimensions.columns, items.length, padding, gridGap])
 
  useEffect(() => {
    window.addEventListener("resize", handleResize)
    handleResize()
    handleScroll()

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [items, minItemWidth, gridGap, padding, handleScroll, handleResize])

  return (
    <div style={{ overflowY: items.length > 0 ? "scroll" : "hidden", maxHeight: "100%" }}
         onScroll={debounce(handleScroll, 50)}>
      <div
        ref={gridRef}
        className={className}
        style={{
          display: "grid",
          gridTemplateRows: `repeat(${dimensions.rows}, minmax(${minItemHeight}px, 1fr)`,
          gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}px, 1fr)`,
          gap: `${gridGap}px ${gridGap}px`,
          padding,
        }}>
        {items.map((item, index) => visibleItems.includes(index) ?
          <Item
            {...item}
            key={index}
            gridColumnStart={1 + index % dimensions.columns}
            gridRowStart={1 + Math.floor(index / dimensions.columns)}
          />
          : null)}
      </ div>
    </ div>
  )
}
