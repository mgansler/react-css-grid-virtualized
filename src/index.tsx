import React from "react"
import ReactDOM from "react-dom"
import "./index.css"
import * as serviceWorker from "./serviceWorker"
import { Grid } from "./Grid"
import { Item, ItemProps } from "./Grid/Item"

const ITEMS_COUNT = 100

const items: ItemProps[] = []

for (let i = 0; i < ITEMS_COUNT; i++) {
  items.push({ width: Math.floor(Math.random() * 600 + 200), height: Math.floor(Math.random() * 400 + 200) })
}

ReactDOM.render(
  <div className={"container"}>
    <Grid<ItemProps>
      Item={Item}
      items={items}
      padding={5}
      gridGap={10}
    />
  </div>,
  document.getElementById("root"),
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
