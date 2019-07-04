import * as React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { debounce, range } from "lodash"

export interface GridPosition {
  gridRowStart: number
  gridColumnStart: number
}

interface GridProps<T> {
  items: T[]
  Item: React.FC<T & GridPosition>
  minItemWidth?: number
  minItemHeight?: number
  gridGap?: number
  padding?: number
}

interface Dimensions {
  rows: number
  columns: number
}

export const Grid = <T extends {}>({ items, Item, minItemWidth = 400, minItemHeight = 400, gridGap = 0, padding = 0 }: GridProps<T>) => {
  const gridRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState<Dimensions>({ rows: items.length, columns: 1 })
  const [visibleItems, setVisibleItems] = useState<number[]>([])

  const handleResize = useCallback(() => {
    if (gridRef.current !== null && items.length > 0) {
      const columnCount = Math.floor(gridRef.current.clientWidth / minItemWidth)
      setDimensions({
        rows: Math.ceil(items.length / columnCount),
        columns: columnCount,
      })
    }
  }, [items.length, minItemWidth])

  const handleScroll = useCallback(() => {
    if (gridRef.current !== null && items.length > 0) {
      const { parentElement, scrollHeight, clientWidth } = gridRef.current
      const columnCount = Math.floor(clientWidth / minItemWidth)

      const firstRow = Math.floor(parentElement!.scrollTop / (scrollHeight / dimensions.rows))
      const lastRow = Math.floor((parentElement!.scrollTop - padding + parentElement!.clientHeight) / (scrollHeight / dimensions.rows))

      const newVisibleItems = range(firstRow * columnCount, Math.min(lastRow * columnCount + columnCount, items.length))
      setVisibleItems(newVisibleItems)
    }
  }, [dimensions.rows, items.length, minItemWidth, padding])

  useEffect(() => {
    window.addEventListener("resize", handleResize)
    handleResize()
    handleScroll()

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [items, minItemWidth, gridGap, padding, handleScroll, handleResize])

  return (
    <div style={{ overflowX: "scroll", maxHeight: "100%" }} onScroll={debounce(handleScroll, 50)}>
      <div
        ref={gridRef}
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
