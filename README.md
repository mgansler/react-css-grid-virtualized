# Lazy Kittens

## What this is about

When dealing with hugh amounts of data, displaying all of it can hinder rendering performance of the browser.
[Googles recommends](https://developers.google.com/web/tools/lighthouse/audits/dom-size) to limit the number of DOM elements to 1500 and to have no more than 60 child nodes for any given element.
It is important to keep in mind, that a single entry in a list may result in multiple DOM elements.
To mitigate this issue it is common (best?) practice to virtualize the DOM, meaning to only render the items actually visible to the user.
Given the example of 1000 cute little kittens, only 20 or so are visible on the screen at any given time.
So why render the 980 others?

This is referred to as [virtualization](https://reactjs.org/docs/optimizing-performance.html#virtualize-long-lists) 

## Motivation

Most virtualization libraries I am aware of [[1](https://github.com/bvaughn/react-virtualized), [2](https://github.com/bvaughn/react-window)] work in the same way:

1. Ask the developer for the dimensions of the items
2. Calculate dimension of the container
3. Set the `position` attribute of the items to `absolute`
4. Calculate `top` and `left` of each item

Every time the browser window size changes, these values need to be calculated again.

## CSS Grid

What if the browser could help with calculating all these numbers?
Well, it actually can, with [CSS Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout).
It has a few advantages to the common approach above:

### Fraction Unit

The fraction unit allows for same (relative) width/height items in the grid.
Given the number of rows/columns and a single rendered item, the total dimension of the grid is calculated automatically.

### Grid Slots

With CSS Grid, there is no need to calculate the `left`/`top` values but the `row` and `column` of each item.
These values (`row`/`column`) are independent of paddings, gaps and even dynamic row heights / column widths.

## Demo

In our example we will build a gallery that shows images of cute little kittens in a grid layout.
We have an array of **40** URLs and we want each image to be at least **400 pixels** wide but all tiles should have the same dimensions.
We also want some space around each tile in our gallery (our grid will have a padding of **5 pixels** and a gap of **10 pixels**).

### Static Example

Given a browser size of **1920 x 1080 pixels** of we want our component to return something like this (first 12 items):

```html
<div id="scrollContainer" style="overflow-y: scroll; height: 100%">
  <div id="grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); grid-template-rows: repeat(10, minmax(400px, 1fr)); gap: 10px 10px; padding: 5px;">
    <div id="item_1" style="grid-row-start: 1; grid-column-start: 1;">Item 1</div>
    <div id="item_2" style="grid-row-start: 1; grid-column-start: 2;">Item 2</div>
    ...
    <div id="item_12" style="grid-row-start: 3; grid-column-start: 4;">Item 12</div>
  </div>
</div>
```

And after scrolling down to the bottom (last 12 items):

```html
<div id="scrollContainer" style="overflow-y: scroll; height: 100%">
  <div id="grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); grid-template-rows: repeat(10, minmax(400px, 1fr)); gap: 10px 10px; padding: 5px;">
    <div id="item_28" style="grid-row-start: 8; grid-column-start: 1;">Item 28</div>
    <div id="item_29" style="grid-row-start: 8; grid-column-start: 2;">Item 29/div>
    ...
    <div id="item_40" style="grid-row-start: 10; grid-column-start: 4;">Item 40</div>
  </div>
</div>
```

Our `scrollContainer` is pretty much self explanatory: it will fill the available space and have its content scrollable vertically.
Let's take a closer look at the `grid`:

* `display: grid;`
  tells the browser that we want a CSS Grid
* `grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));`
  tells the browser to fit as many items as possible in one row as long as they are at least `400px` wide.
  They also should all have the same width (`1fr`)
* `grid-template-rows: repeat(10, minmax(400px, 1fr));`
  tells the browser to have 10 rows of 400px height.
  Where did the `10` come from? We need to calculate that in our component (40 items / 4 columns => 10 rows).
  We also use `minmax(400px, 1fr)` here, but more on that later.
* `gap: 10px 10px;` will result in a horizontal and vertical gap between each item of 10 pixels.
* `padding: 5px` will result in a 5 pixel space around the outermost tiles.

The neat thing about CSS Grids is, that you can specify where exactly an `item` needs to go.
By specifying `grid-row-start` and `grid-column-start` we can position each `item` exactly where we want to without manually calculating the `top`/`left` property.

### React

The Demo will be implemented as a Functional Component utilizing [React Hooks](https://reactjs.org/docs/hooks-intro.html).

Our input (to be changed by the user) are the following properties:
```typescript jsx
/**
* items: array - randomly generated data.
* gridGap: number - the space between the items
* padding: number - the space from the edge of the grid to the items
* square: boolean - whether the grid items are forced to be square
*/
```

Additionally, the developer can provide the following properties during build time:
```typescript jsx
/**
* Item: React Component - used to render every entry in the list
* minItemWidth: number - the minimum width of each item
* minItemHeight: number - the minimum height of each item
*/
```

### Hooks

Our components needs a few Hooks to properly function:

#### [`useRef`](https://reactjs.org/docs/hooks-reference.html#useref)

This hooks gives us a reference to the `<div />` Element that is our Grid.
We need this for access to the dimensions and scroll position of the container wrapping the grid.

```typescript jsx
  const gridRef = useRef<HTMLDivElement>(null)
```

#### [`useState`](https://reactjs.org/docs/hooks-reference.html#usestate)

Functional components are stateless by default.
The `useState` hook gives us a way to pass (and mutate) some value from one render iteration to another.
In our case we need to store the count of `rows` and `columns` in our grid as well as what items are currently visible.
The `renderState` is required because we the first to render iterations are special.

```typescript jsx
// Do not render any items on the first iteration
const [gridState, setGridState] = useState<GridState>({
  rows: 0,
  columns: 0,
  visibleItems: [],
  renderState: RenderState.Initial,
})
```

#### [`useCallback`](https://reactjs.org/docs/hooks-reference.html#usecallback)

TODO: this will hopefully go away when we use `useReducer`

```typescript jsx
const updateVisibleItems = useCallback(() => {
  if (gridRef.current !== null) {
    // CSS Grid auto-fit puts as many items in a single row as long as they can be wider than the minimal item width.
    // It uses the exact value of the grid to calculate that. (gridRef.current.clientWidth is rounded)
    // We add an additional virtual gap to the width so we can divide by (minItemWidth + gridGap).
    const columnCount = Math.floor((gridRef.current.getBoundingClientRect().width + gridGap - 2 * padding) / (minItemWidth + gridGap))
    const rowCount = Math.ceil(items.length / columnCount)
    if (gridState.renderState === RenderState.Initial) {
      setGridState({
        rows: rowCount,
        columns: columnCount,
        visibleItems: range(0, Math.min(columnCount, items.length)),
        renderState: RenderState.SingleRow,
      })
      return
    }
    const { parentElement, scrollHeight } = gridRef.current
    // Our row height is the height of an item plus a grid gap
    const rowHeightWithGap = ((scrollHeight + gridGap - 2 * padding) / rowCount)
    // For the first visible row we are interested when the lower boundary of an item enters/leaves the screen.
    let firstVisibleRow = Math.max(Math.floor((parentElement!.scrollTop + gridGap - padding) / rowHeightWithGap), 0)
    // For the last visible row we are interested when the upper boundary of an item enters/leaves the screen.
    const lastVisibleRow = Math.floor((parentElement!.scrollTop + parentElement!.getBoundingClientRect().height - padding) / rowHeightWithGap)
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
    // Avoid re-rendering when items do not change
    const newGridState: GridState = {
      rows: rowCount,
      columns: columnCount,
      visibleItems: newVisibleItems,
      renderState: RenderState.Continuous,
    }
    if (isUpdateRequired(gridState, newGridState)) {
      setGridState(newGridState)
    }
  }
}, [gridState, items.length, padding, gridGap, minItemWidth])
```


#### [`useEffect`](https://reactjs.org/docs/hooks-reference.html#useffect)

An effect is something that is called *after* a component has been rendered.
In this case it registers the `updateVisibleItems` callback to the Window `resize` event.
It also calls the `updateVisibleItems` after the first two render iterations to ensure the correct amount if items is rendered.

```typescript jsx
useEffect(() => {
  window.addEventListener("resize", updateVisibleItems)
  if (gridState.renderState < RenderState.Continuous) {
    updateVisibleItems()
  }
  return () => {
    window.removeEventListener("resize", updateVisibleItems)
  }
}, [gridState.renderState, updateVisibleItems])
```

### Return value

Every Function Component needs to return [JSX](https://reactjs.org/docs/introducing-jsx.html) that is than rendered in the browser.
In our component it basically returns the static examples from above filled with values calculated by `updateVisibleItems`

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

### Square Items

Square items of dynamic size are usually solved with a CSS trick:

```css
.square:before {
    content: "";
    grid-row-start: 1;
    grid-column-start: 1;
    padding-bottom: 100%;
}
```

When specifying the `padding` in percent it depends on the width of the parent element.
In our case that is the grid slot, meaning that every tile will have the same height as its width.
We only need to attach the `sqaure` class to our `grid` element.
This works because in the case of CSS grid `:before` will be the *first* item in the grid, while `:after` will become the last item.

### What's missing

- preloading
- limit of 1000 (Chrome) / 10000 (Firefox) rows
- further optimizations

