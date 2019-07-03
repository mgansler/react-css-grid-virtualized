import ReactDOM from "react-dom"
import * as React from "react"
import { Grid } from "./Grid"

const ItemMock: React.FC<{ a: number }> = ({ a }) => <div>{a}</div>

it("should render as expected when no items given", () => {
  const container = document.createElement("div")
  ReactDOM.render(<Grid Item={ItemMock} items={[]}/>, container)

  expect(container.innerHTML).toBe("<div class=\"grid\"></div>")
})

it("should render as expected when two items given", () => {
  const container = document.createElement("div")
  ReactDOM.render(<Grid Item={ItemMock} items={[{ a: 1 }, { a: 2 }]}/>, container)

  expect(container.innerHTML).toBe("<div class=\"grid\"><div>1</div><div>2</div></div>")
})
