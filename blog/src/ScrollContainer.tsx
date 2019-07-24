import * as React from "react"
import { Dispatch } from "react"
import { Action, GridAction } from "./types"
import { throttle } from "./utils"

interface ScrollContainerProps {
  itemCount: number
  onScroll: Dispatch<GridAction>
}

export const ScrollContainer: React.FC<ScrollContainerProps> = ({ children, itemCount, onScroll }) => <div
  style={{ overflowY: itemCount > 0 ? "scroll" : "hidden", height: "100%" }}
  onScroll={throttle(() => onScroll({ type: Action.Scroll }), 100)}>{children}</div>
