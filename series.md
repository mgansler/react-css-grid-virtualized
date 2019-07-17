# Virtualization with CSS Grid (and React) - Part 1

## Concepts of Virtualization

When dealing with large amounts of data in an web application it is not always feasible to show everything at once.
There may be several reasons for this:

1. The user want's to see only a subset of the data -> filtering
2. The data is so large it cannot be transmitted all at once -> pagination
3. The browser cannot handle to show all the data (performance reasons) -> virtualization

In this series we want to concentrate on virtualization.
For brevity we will focus on the case of showing a grid of uniform elements, a gallery for example.
It is needed because memory is limited and because the more complex the DOM becomes, the slower the browser gets and scrolling starts to be [ruckelig].
Google recommends to not have more than 1500 elements in the DOM.

Virtualization relies on the fact that such hugh amounts of data usually don't fit on the screen.
There is always some part of the screen outside the visible area.
These parts don't need to be rendered until the users starts to scroll them into the view.
As long as the scrollbar has the correct size and position the user will have the illusion that all the data is shown all the time.

### HTML Structure

In the browser this translates to the following HTML structure:

```html
<div id="scroll_container">
  <div id="wrapper">
    <div class="item"></div>
    ...
  </div>
</div>
```

1. Scroll Container (`#scroll_container`):

   This element fills the available space on the screen.
   The scrollbar belongs to this element.

2. Wrapper Div (`#wrapper`):

   This element's size is what would be needed to show all the available elements, therefor extending off the screen.
   Its position changes when the user scrolls.
   It moves up when the user scrolls down and vice versa.
   Same for left and right.

3. Items (`.item`):

   There are many instances of this element, not necessarily all the same.
   Some may show text, others numbers or images.
   But only the elements that are visible in the current viewport are rendered.

## State of the Art

Most libraries I know of work in the same way.
One example of such a library is [react-virtualized](https://github.com/bvaughn/react-virtualized).
The API requires the developer to provide the total `width` and `height` of the `#wrapper` element as well as the `width` (column) and `height` (row).
The libraries also need to know the number of `rows` and `columns`.

Whenever the user scrolls the `scrollTop` (and/or) `scrollLeft` property of the `#scroll_container` is read.
Depending on these values and the column widths and row heights the currently visible items can be determined.
In order to render the first visible `.item` in the correct position in relation to the `#wrapper` they set the `position` attribute to `absolute` and calculate the `left` and `top` attribute.
This calculation needs to be repeated vor every item and for every scroll position.
Depending on the amount of visible items this can cause a high load, especially on older devices.

Doing it this way isn't necessarily bad as it gives you a lot of flexibility and compatibility across browsers.
But there is another solution for the positioning problem: CSS Grid.

## Introduction to CSS Grid

// TODO: browser support of css grid
// TODO: explain css grid

Looking back at our example for above:

```html
<div id="scroll_container">
  <div id="wrapper">
    <div class="item"></div>
    ...
  </div>
</div>
```

The CSS would look like this:

```css
#scroll_container {
    overflow-y: scroll;
    width: 1600px;
    height: 1000px
}

#wrapper {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(10, 1fr);
}

.item {
    height: 400px;
}
```

This would yield us a visible area of 1600 x 1000 pixel.
The grid with 4 column and 10 rows has enough room for 40 items in total.
All columns would have the same width because of `1fr`: 400 pixel.
The same is true for the height of the rows: All of an equal height of 400 pixel.
The `#wrapper` has the same width as the `#scroll_container` of 1600 pixel but a height of 4000 pixel (10 rows at 400 pixel each).

Now, when the user just opened the page only the top 12 items (4 columns and 2.5 rows) would be visible:

```html
<div id="scroll_container">
  <div id="wrapper">
    <div class="item" style="grid-row-start: 1; grid-column-start: 1;">1</div>
    <div class="item" style="grid-row-start: 1; grid-column-start: 2;">2</div>
    ...
    <div class="item" style="grid-row-start: 3; grid-column-start: 4;">12</div>
  </div>
</div>
```

When the user scrolls all the way down to the bottom only the last 12 items would be visible:

```html
<div id="scroll_container">
  <div id="wrapper">
    <div class="item" style="grid-row-start: 8; grid-column-start: 1;">29</div>
    <div class="item" style="grid-row-start: 8; grid-column-start: 2;">30</div>
    ...
    <div class="item" style="grid-row-start: 10; grid-column-start: 4;">40</div>
  </div>
</div>
```

The browser knows that the 9th row starts at a top position of 3200 pixel.

# Virtualization with CSS Grid (and React) - Part 2

In this part we will look at an actual implementation of last weeks Article in React.
We will discuss what actions the component needs to respond to.
We will also have a look at the differences of the component implemented as a traditional [React Class Component](https://reactjs.org/docs/react-component.html) and a React Function Component using [React Hooks](https://reactjs.org/docs/hooks-intro.html).

## User/Browser Events

A virtualization component needs to react to three different events:

1. `resize`: When the browsers window size changes.
2. `scroll`: When the user scrolls.
3. `props` update: Configuration or data is changed from outside the component.

## React Lifecycle

A React Component has three phases in its [lifecycle](https://reactjs.org/docs/react-component.html#the-component-lifecycle):

1. Mounting
2. Updating
3. Unmounting

### Mounting

This is the phase in which the component is rendered for the first time, after the application starts or when the user navigates to a part in the application.
In this phase the component needs to add an Event Listener for the Windows `resize` event.
Because the gallery should be responsive we specify the `minItemWidth` instead of the number of columns/rows.
This has the disadvantage that we need three render iterations during the mounting phase.

1. Initial render with an empty grid.
2. Calculate the number of columns (and rows) depending on the parent width, render a single row.
3. Now that we know the total height of the grid we can calculate the height of a single row and determine how many rows are visible: render these rows.

### Updating

Most of the time is spent in this phase.
Other than updating the props there are two events that possibly change which and how many items are visible.
There are two events that are bound to trigger a recalculation: `resize` of the browser window and `scroll` on the `#scrollContainer`.
This first one doesn't happen as often but might still occur depending on the users workflow, placing the browser and another application side by side or going fullscreen for example.
For mobile, rotating the device is also a resizing of the browser window.
Scrolling will be the most frequent event by far.
In fact the browser triggers the `scroll` event many times per second while scrolling.

Both events can be handled with the same logic as the only difference is, that scrolling will never change the numbers of rows and columns.

1. Calculate column and row count.
2. Calculate first and last visible row and with that, the first and last visible items.
3. Update the state to trigger a new render iteration.

### Unmounting

There is not much to do in this phase as React takes care about removing the HTML elements from the DOM.
Our component just needs to remove the Event Listener for `resize`.

## Types

The examples below use [Typescript], a superset of JavaScript with types.
So lets start with the types definitions which will be used by both the Class and Function Component.

```typescript
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
  minItemHeight?: number
  minItemWidth?: number
  padding?: number
  preload?: number
}

export interface GridState {
  visibleItems: number[]
  rows: number
  columns: number
}
```

The `GridPosition` is what is passed additionally to the `Item`.
It tells the item in which row / column it belongs.

`GridProps<T>` is a generic and defines the `props` of the Grid Component.
Most of them are optional, the only required ones are the `Item` Component and the array of item data.

The `GridState` defines the internal state of the components.
The row and column count as well as the currently visible items.

## React Class Component

We will start with the Class Component as this is what most developers are currently used to even though it was implemented after the Function Component.
Despite the complexity of the problem the structure of that class is quite simple.
At the top, we define the `defaultProps`, the `initial state` and create a `ref` to the `#grid` Element:

### Initialization

```typescript jsx
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
```

### State Update

Then, there is one function that is called whenever the browser window size changes or the user scrolls:

```typescript jsx
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
```

This function calculates how many items fit in one row of the grid (and how many rows the grid needs to fit *all* items).
It then determines what items are currently visible depending on the scroll position and sets the new state.
The update of the state triggers a new render.

### `componentDidMount`

This method is called after the first render.
At this time the width of the `#grid` element is known and we can calculate the column and row count.
We then set a new state with those values and the topmost row of items and trigger a recalculation as the optional second argument to the `setState` method.
We do this because we need at least one item rendered to determine the height of a row and the total height of the grid.

Last but not least we register an Event Listener for the `resize` event.

```typescript jsx
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

  window.addEventListener("resize", this.updateState)
}
```

### `componentWillUnmount`

This method is called be the React framework just before the component will be removed from the DOM.
This is where we need to take care of removing the Event Listener:

```typescript jsx
componentWillUnmount() {
  window.removeEventListener("resize", this.updateState)
}
```

### `render`

This is the only method in a React Class Component whose implementation is not optional.
It must rest [JSX](https://reactjs.org/docs/introducing-jsx.html) that is then rendered in the browser.

```typescript jsx
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
```

## React Function Component

Our Function Component relies onto [Hooks](https://reactjs.org/docs/hooks-intro.html) (introduced in React 16.8):

### [`useRef`](https://reactjs.org/docs/hooks-reference.html#useref)

This hook gives us a reference to the `<div />` Element that is our GridFc.
We need this for access to the dimensions and scroll position of the container wrapping the grid.

```typescript jsx
  const gridRef = useRef<HTMLDivElement>(null)
```

### [`useReducer`](https://reactjs.org/docs/hooks-reference.html#usereducer)

This reducer enables the component to transfer state from one render iteration to the next.
There is also [`useState`](https://reactjs.org/docs/hooks-reference.html#usestate) for simple values like a counter or a boolean.
In our case, we do complex calculations and return a state with three sub-values (`rows`, `columns` and `visibleItems`).

The `useReducer` hook accepts two arguments: The `reducer` function and the `initial state`.
The `reducer` function itself accepts two arguments as well: `current state` and an `action`.

To quote the React Docs:

> An alternative to useState. Accepts a reducer of type (state, action) => newState, and returns the current state paired with a dispatch method.
> **(If you’re familiar with Redux, you already know how this works.)**

#### Types

There are three types that are only used in the Function Component:

```typescript
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
```

The `RenderState` is used to keep track of in which state the component currently is in.
Same as the Class Component we render an empty Grid first, then a single row and only then we know how many are actually visible.
The first row always will be visible as the user had no opportunity to scroll yet.

The `Action` and `GridAction` could be simplified as we never use a payload in our actions, but we could.

#### Reducer

The reducer looks complicated but basically does two things: Calculate how many columns and rows are needed in total and which items are currently visible.

```typescript jsx
function reduceGridState(state: GridState, action: GridAction): GridState {
  // We want at least one column, even if the parent is narrower than the minItemWidth
  const columnCount = Math.max(Math.floor((gridRef.current!.getBoundingClientRect().width + gridGap - 2 * padding) / (minItemWidth + gridGap)), 1)
  const rowCount = Math.ceil(items.length / columnCount)

  // After the initial render we add a single row so we know the height of the grid during the next render
  if (action.type === Action.Initial) {
    renderState.current = RenderState.SingleRow
    return {
      rows: rowCount,
      columns: columnCount,
      visibleItems: range(0, Math.min(columnCount, items.length)),
    }
  }

  const { parentElement, scrollHeight } = gridRef.current!

  // Our row height is the height of an item plus a grid gap
  const rowHeightWithGap = ((scrollHeight + gridGap - 2 * padding) / state.rows)

  // For the first visible row we are interested when the lower boundary of an item enters/leaves the screen.
  let firstVisibleRow = Math.max(Math.floor((parentElement!.scrollTop + gridGap - padding) / rowHeightWithGap - preload), 0)
  // For the last visible row we are interested when the upper boundary of an item enters/leaves the screen.
  const lastVisibleRow = Math.floor((parentElement!.scrollTop + parentElement!.getBoundingClientRect().height - padding) / rowHeightWithGap + preload)

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

  renderState.current = RenderState.Continuous
  return isUpdateRequired(state, newState) ? newState : state
}

const [gridState, dispatchGridState] = useReducer(reduceGridState, {
  // Initially we do not render any items
  rows: 0,
  columns: 0,
  visibleItems: [],
})
```

The `function reduceGridState` mirrors the function of the `updateState` method from the Class Component above.
It calculates the number of columns and rows required in total for the Grid and then determines which items are currently visible.

### [`useEffect`](https://reactjs.org/docs/hooks-reference.html#useffect)

An effect is a method that is called *after* a component has been rendered.
We use three different effects in our component:

1.  Dispatch the correct actions after the initial and secondary render iteration:

    ```typescript jsx
    useEffect(() => {
      // Use switch to ensure only one action is dispatched
      switch (renderState.current) {
        case RenderState.Initial:
          dispatchGridState({ type: Action.Initial })
          break
        case RenderState.SingleRow:
          dispatchGridState({ type: Action.Secondary })
          break
      }
    })
    ```

    Because this effect has no dependencies (second optional parameter, see below) it will be called after every render.
    But it will only dispatch an action after the first and second render.

2.  Dispatch an update action after the props of the component have changed

    ```typescript jsx
    useEffect(() => {
      if (renderState.current === RenderState.Continuous) {
        dispatchGridState({ type: Action.PropsUpdate })
      }
    }, [gridGap, items.length, minItemWidth, padding, className, preload])
    ```

    This effect has dependencies on all props of the component and will be called when any changes,
    resulting in a change of the gridState when necessary.

3.  Register an event listener for browser window resize.

    ```typescript jsx
    useEffect(() => {
      // @ts-ignore
      window.addEventListener(Action.Resize, dispatchGridState)
      return () => {
        // @ts-ignore
        window.removeEventListener(Action.Resize, dispatchGridState)
      }
    }, [])
    ```

    This effect has the empty array as dependencies.
    It will only be called once (after the initial render), registering the event listener.
    It also returns a function that is called on un-mounting the component, removing the event listener.

### Return value

Every Function Component needs to return [JSX](https://reactjs.org/docs/introducing-jsx.html) that is then rendered in the browser.
The only difference to the Class Component is how properties are referenced.
In a Function Component there is no `this`.

```typescript jsx
return (
  <ScrollContainer itemCount={items.length} onScroll={updateVisibleItems}>
    <div
      ref={gridRef}
      className={className}
      style={{
        display: "grid",
        gridTemplateRows: `repeat(${gridState.rows}, minmax(${minItemHeight}px, 1fr)`,
        gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}px, 1fr)`,
        gap: `${gridGap}px ${gridGap}px`,
        padding,
      }}
    >
      {gridState.visibleItems.map(id => items[id] ? <Item
        {...items[id]}
        key={id}
        gridColumnStart={1 + id % gridState.columns}
        gridRowStart={1 + Math.floor(id / gridState.columns)}
      /> : null)}
    </ div>
  </ ScrollContainer>
)
```

## Conclusion

Apart from minor differences such as accession the `props` and the `state` with `this` in a Class Component the only major difference is in how we handle the [Mounting Phase](#mounting).
Because we use a [reducer](https://reactjs.org/docs/hooks-reference.html#usereducer) in the Function Component we cannot set the new state in the `useEffect` directly but need to use ac `Action` instead.

The [aufmerksame] reader might have noticed that both variants call a function named `isUpdateRequired`.
That function compares the current state with the new one and returns `true` or `false` depending on if values have changed.
This needs to be done manually because the `reducer` in the Functional Component does a `Object.is()` comparison.
In cases where the reducer has been called but the values haven't actually changed (the user scrolled just a little bit) we can then return the old state instead of the new one, thus avoiding a unnecessary render.
The same is true for the Class Component: we do not update the state if this method returns `false` to avoid re-rendering.

```typescript
// Compares the first and last element of the given arrays
const areVisibleItemsEqual = (lastVisibleItems: number[], newVisibleItems: number[]) => {
  if (lastVisibleItems.length !== newVisibleItems.length) {
    return false
  }
  const length = lastVisibleItems.length

  if (length === 0) {
    // both empty
    return true
  }

  return lastVisibleItems[0] === newVisibleItems[0] && lastVisibleItems[length - 1] === newVisibleItems[length - 1]
}

export const isUpdateRequired = (oldGridState: GridState, newGridState: GridState): boolean => {
  const { rows: currentRows, columns: currentColumns, visibleItems: currentVisibleItems } = oldGridState
  const { rows: newRows, columns: newColumns, visibleItems: newVisibleItems } = newGridState

  return currentColumns !== newColumns || currentRows !== newRows || !areVisibleItemsEqual(currentVisibleItems, newVisibleItems)
}
```

# Virtualization with CSS Grid (and React) - Part 3

## (optional) Library

## Testing

? Responsiveness
? Dynamic item sizes
? Optimization