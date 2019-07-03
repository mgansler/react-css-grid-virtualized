import ReactDOM from "react-dom"
import * as React from "react"
import { Grid } from "./Grid"

const ItemMock: React.FC<{ a: number }> = ({ a }) => <div>{a}</div>

let container: HTMLDivElement

beforeEach(() => {
  container = document.createElement("div")
})

afterEach(() => {
  ReactDOM.unmountComponentAtNode(container)
})

it("should render empty grid", () => {
  ReactDOM.render(<Grid Item={ItemMock} items={[]}/>, container)

  expect(container.innerHTML).toBe("<div class=\"grid\" style=\"grid-template-rows: repeat(0, minmax(400px, 1fr);\"></div>")
})

it("should render two items", () => {
  const container = document.createElement("div")
  ReactDOM.render(<Grid Item={ItemMock} items={[{ a: 1 }, { a: 2 }]}/>, container)

  expect(container.innerHTML).toBe("<div class=\"grid\" style=\"grid-template-rows: repeat(2, minmax(400px, 1fr);\"><div>1</div><div>2</div></div>")
})
