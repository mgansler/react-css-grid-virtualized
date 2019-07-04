import * as React from "react"
import "./item.css"

export interface ItemProps {
  width: number
  height: number
  style?: object
}

export const Item: React.FC<ItemProps> = ({ width, height, style }) => {
  return <div
    className={"item"}
    style={{
      backgroundImage: `url(https://placekitten.com/g/${width}/${height})`,
      ...style,
    }}
  />
}
