import React from "react"
import { Action, GridProps, GridState } from "./types"
import { ScrollContainer } from "./ScrollContainer"
import { isUpdateRequired } from "./isUpdateRequired"
import { range } from "./utils"

export class GridClass<T> extends React.Component<GridProps<T>, GridState> {
  static defaultProps = {
    minItemWidth: 400,
    minItemHeight: 400,
    gridGap: 0,
    padding: 0,
    preload: 0,
  }

  state: GridState = {
    // Initially we do not render any items
    rows: 0,
    columns: 0,
    visibleItems: [],
  }

  gridRef = React.createRef<HTMLDivElement>()

  updateState = () => {
    const { gridGap, padding, minItemWidth, items, preload } = this.props

    // We want at least one column, even if the parent is narrower than the minItemWidth
    const columnCount = Math.max(Math.floor((this.gridRef.current!.getBoundingClientRect().width + gridGap! - 2 * padding!) / (minItemWidth! + gridGap!)), 1)
    const rowCount = Math.ceil(items.length / columnCount)

    const { parentElement, scrollHeight } = this.gridRef.current!

    // Our row height is the height of an item plus a grid gap
    const rowHeightWithGap = ((scrollHeight + gridGap! - 2 * padding!) / this.state.rows)

    // For the first visible row we are interested when the lower boundary of an item enters/leaves the screen.
    let firstVisibleRow = Math.max(Math.floor((parentElement!.scrollTop + gridGap! - padding!) / rowHeightWithGap - preload!), 0)
    // For the last visible row we are interested when the upper boundary of an item enters/leaves the screen.
    const lastVisibleRow = Math.floor((parentElement!.scrollTop + parentElement!.getBoundingClientRect().height - padding!) / rowHeightWithGap + preload!)

    // If only a single row fit's the screen we also render the row above
    // to avoid jumping that might occur when the last (total) row contains fewer items that would fit.
    // Otherwise, these items would appear stretched.
    if (firstVisibleRow === lastVisibleRow && firstVisibleRow > 0) {
      firstVisibleRow--
    }

    const newVisibleItems = range(
      firstVisibleRow * columnCount,
      Math.min(lastVisibleRow * columnCount + columnCount, items.length),
    )

    const newState: GridState = {
      rows: rowCount,
      columns: columnCount,
      visibleItems: newVisibleItems,
    }

    if (isUpdateRequired(this.state, newState)) {
      this.setState(newState)
    }
  }

  componentDidUpdate(prevProps: Readonly<GridProps<T>>, prevState: Readonly<GridState>, snapshot?: any): void {
    if (prevProps !== this.props) {
      this.updateState()
    }
  }

  componentDidMount() {
    const { gridGap, padding, minItemWidth, items } = this.props

    // We want at least one column, even if the parent is narrower than the minItemWidth
    const columnCount = Math.max(Math.floor((this.gridRef.current!.getBoundingClientRect().width + gridGap! - 2 * padding!) / (minItemWidth! + gridGap!)), 1)
    const rowCount = Math.ceil(items.length / columnCount)

    this.setState({
      rows: rowCount,
      columns: columnCount,
      visibleItems: range(0, Math.min(columnCount, items.length)),
    }, this.updateState)

    window.addEventListener(Action.Resize, this.updateState)
  }

  componentWillUnmount(): void {
    window.removeEventListener(Action.Resize, this.updateState)
  }

  render() {
    const { className, items, Item, minItemWidth, minItemHeight, gridGap, padding } = this.props

    return <ScrollContainer itemCount={items.length} onScroll={this.updateState}>
      <div
        ref={this.gridRef}
        className={className}
        style={{
          display: "grid",
          gridTemplateRows: `repeat(${this.state.rows}, minmax(${minItemHeight}px, 1fr)`,
          gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}px, 1fr)`,
          gap: `${gridGap}px ${gridGap}px`,
          padding,
        }}
      >
        {this.state.visibleItems.map(id => items[id] ? <Item
          {...items[id]}
          key={id}
          gridColumnStart={1 + id % this.state.columns}
          gridRowStart={1 + Math.floor(id / this.state.columns)}
        /> : null)}
      </div>
    </ScrollContainer>
  }
}
