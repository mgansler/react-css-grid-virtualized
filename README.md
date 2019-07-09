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

We want our component to return something like this (first 20 items):

```html
<div style="overflow-y: hidden; max-height: 100%">
  <div style="display: grid; grid-template-columns: repeat(4, 400px); grid-template-rows: repeat(10, 400px)">
    <div style="grid-column-start: 1; grid-row-start: 1">Item 1</div>
    <div style="grid-column-start: 2; grid-row-start: 1">Item 2</div>
    ...
    <div style="grid-column-start: 4; grid-row-start: 5">Item 20</div>
  </div>
</div>
```

And after scrolling down to the bottom (last 20 items):

```html
<div style="overflow-y: hidden; max-height: 100%">
  <div style="display: grid; grid-template-columns: repeat(4, 400px); grid-template-rows: repeat(10, 400px)">
    <div style="grid-column-start: 1; grid-row-start: 6">Item 21</div>
    <div style="grid-column-start: 2; grid-row-start: 6">Item 22</div>
    ...
    <div style="grid-column-start: 4; grid-row-start: 10">Item 40</div>
  </div>
</div>
```

### Hooks

Our components needs a few Hooks to properly function:

#### `useRef`

explain hook

A reference to the `<div />` Element that is our Grid.
We need this for access to the dimensions and scroll position of the container wrapping the grid.

```typescript jsx
  const gridRef = useRef<HTMLDivElement>(null)
```

#### `useState`

explain hook

We need to store the `dimensions`, meaning the number of `rows` and `columns` in our grid
as well as `visibleItems`, that stores the indices of the currently visible items.

```typescript jsx
  // Do not render any items on the first iteration
  const [dimensions, setDimensions] = useState<Dimensions>({ rows: 0, columns: 0 })
  const [visibleItems, setVisibleItems] = useState<number[]>([])
```

#### `useCallback`

explain hook

1. `handleScroll`:
  This method is called `onScroll` and updates the `visibleItems` array.

    ```typescript jsx
    ```

2. `handleResize`:
  This callback is responsible for updating the dimensions.
  It is called whenever the browser window size changes.

    ```typescript jsx
    ```


#### `useEffect`

An effect is something that is called *after* a component has been rendered.
In this case it registers the `handleResize` callback to the Window `resize` event.
It also calls the `handleResize` (which than calls `handleScroll`) method after the initial render so that the correct amount of items is rendered.

```typescript jsx
useEffect(() => {
  window.addEventListener("resize", handleResize)
  handleResize()
  
  return () => {
    window.removeEventListener("resize", handleResize)
  }
}, [items, minItemWidth, gridGap, padding, handleScroll, handleResize])
```

### Return value 

```typescript jsx

```

### What's missing

- preloading
- limit to 1000 (Chrome) / 10000 (Firefox) rows

