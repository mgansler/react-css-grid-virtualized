import { Item } from "./Item"
import * as React from "react"
import ReactDOM from "react-dom"

it("should render as expected", () => {
  const container = document.createElement("div")
  ReactDOM.render(<Item width={400} height={200}/>, container)

  expect(container.innerHTML).toBe("<div class=\"item\" style=\"background-image: url(https://placekitten.com/g/400/200);\"></div>")
})
