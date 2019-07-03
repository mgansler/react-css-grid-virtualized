import * as React from "react"
import "./grid.css"

interface GridProps {
  items: any[]
  Item: React.FC<any>
}

export const Grid: React.FC<GridProps> = ({ items, Item }) => {
  return (
    <div className={"grid"}>
      {items.map((item, index) => <Item
        key={index}
        {...item}
      />)}
    </ div>
  )
}
