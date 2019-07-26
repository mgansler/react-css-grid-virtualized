import * as React from "react"
import { BrowserRouter, Route } from "react-router-dom"
import { Controlled, GapAndPadding, Minimal, Preload, SquareItems } from "./Examples"

const Index: React.FC = () => {
  return (
    <ul>
      <li>
        <a href={"/minimal"}>Minimal</a>
      </li>
      <li>
        <a href={"/preload"}>Preload</a>
      </li>
      <li>
        <a href={"/gapandpadding"}>Gap and Padding</a>
      </li>
      <li>
        <a href={"/square"}>Square</a>
      </li>
      <li>
        <a href={"/controlled"}>Controlled</a>
      </li>
    </ul>
  )
}

export const Routes: React.FC = () => {
  return (
    <BrowserRouter>
      <Route path={"/"} exact={true} component={Index}/>
      <Route path={"/minimal"} component={Minimal}/>
      <Route path={"/preload"} component={Preload}/>
      <Route path={"/gapandpadding"} component={GapAndPadding}/>
      <Route path={"/square"} component={SquareItems}/>
      <Route path={"/controlled"} component={Controlled}/>
    </BrowserRouter>
  )
}
