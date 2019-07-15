# Virtualization with CSS GridFc (and React) - Part 1

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
But there is another solution for the positioning problem: CSS GridFc.

## Introduction to CSS GridFc

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

# Virtualization with CSS GridFc (and React) - Part 2

## (optional) React Class Component

## React Functional Component

# Virtualization with CSS GridFc (and React) - Part 3

## (optional) Library

## Testing

? Responsiveness
? Dynamic item sizes
? Optimization
