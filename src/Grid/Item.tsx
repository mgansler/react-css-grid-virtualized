import * as React from "react"

export interface ItemProps {
  width: number
  height: number
}

export const Item: React.FC<ItemProps> = ({ width, height }) => {
  return <div
    className={"item"}
    style={{ backgroundImage: `url(https://placekitten.com/g/${width}/${height})` }}
  />
}
