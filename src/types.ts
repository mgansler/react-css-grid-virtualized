import * as React from "react"

export interface GridPosition {
  gridRowStart: number
  gridColumnStart: number
}

export interface GridProps<T> {
  className?: string
  gridGap?: number
  Item: React.FC<T & GridPosition>
  items: T[]
  minItemHeight: number
  minItemWidth: number
  padding?: number
  preload?: number
}

export interface GridState {
  visibleItems: number[]
  rows: number
  columns: number
}

export enum RenderState {
  Initial,
  SingleRow,
  Continuous,
}

export enum Action {
  Initial = "initial",
  Secondary = "secondary",
  PropsUpdate = "props updated",
  Resize = "resize",
  Scroll = "scroll",
}

export interface GridAction {
  type: Action
}
