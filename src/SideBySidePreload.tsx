import { generateItems } from "./Controls"
import { GridFc } from "./Grid.fc"
import { Kitten } from "./Kitten"
import * as React from "react"
import "./sidebyside.css"

const items = generateItems(40)

export const SideBySidePreload: React.FC = () => {
  return <div className={"sidebyside"}>
    <div className={"column left"}>
      <span className={"Header"}>No Preload</span>
      <GridFc Item={Kitten} items={items} gridGap={10} padding={5} minItemHeight={200} minItemWidth={200} preload={0}/>
    </div>
    <div className={"column right"}>
      <span className={"Header"}>2 Rows Preload</span>
      <GridFc Item={Kitten} items={items} gridGap={10} padding={5} minItemHeight={200} minItemWidth={200} preload={2}/>
    </div>
  </div>
}
