import * as React from "react"
import "./item.css"
import { GridPosition } from "./types"

export interface KittenProps {
  width: number
  height: number
}

export const Kitten: React.FC<KittenProps & GridPosition> = ({ width, height, gridColumnStart, gridRowStart }) => {
  return <div
    className={"item"}
    style={{
      backgroundImage: `url(https://placekitten.com/g/${width}/${height})`,
      gridRowStart,
      gridColumnStart,
    }}
  />
}
