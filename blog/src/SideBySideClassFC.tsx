import { generateItems } from "./Controls"
import { GridFc } from "./Grid.fc"
import { Kitten } from "./Kitten"
import * as React from "react"
import "./sidebyside.css"
import { GridClass } from "./Grid.class"

const items = generateItems(40)

export const SideBySideClassFC: React.FC = () => {
  return <div className={"sidebyside"}>
    <div className={"column left"}>
      <span className={"header"}>Class Component</span>
      <GridClass
        Item={Kitten}
        items={items}
        gridGap={10}
        padding={5}
        minItemHeight={200}
        minItemWidth={200}
        preload={0}
      />
    </div>
    <div className={"column right"}>
      <span className={"header"}>Functional Component</span>
      <GridFc
        Item={Kitten}
        items={items}
        gridGap={10}
        padding={5}
        minItemHeight={200}
        minItemWidth={200}
        preload={0}
      />
    </div>
  </div>
}
