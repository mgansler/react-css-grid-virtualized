import * as React from "react"
import { useEffect, useRef, useState } from "react"
import "./grid.css"

interface GridProps {
  items: any[]
  Item: React.FC<any>
}

export const Grid: React.FC<GridProps> = ({ items, Item }) => {
  const gridRef = useRef<HTMLDivElement>(null)
  const [rowCount, setRowCount] = useState<number>(items.length)

  const handleResize = () => {
    if (gridRef.current !== null && items.length > 0) {
      const { clientWidth, childNodes } = gridRef.current
      const columnCount = Math.floor(clientWidth / (childNodes.item(0) as HTMLDivElement).clientWidth)
      setRowCount(Math.ceil(items.length / columnCount))
    }
  }

  useEffect(() => {
    window.addEventListener("resize", handleResize)
    handleResize()

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  })

  return (
    <div className={"grid"} ref={gridRef} style={{ gridTemplateRows: `repeat(${rowCount}, minmax(400px, 1fr)` }}>
      {items.map((item, index) => <Item
        key={index}
        {...item}
      />)}
    </ div>
  )
}
