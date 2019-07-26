# Examples

To run the examples execute the following commands in the `examples` directory and open http://localhost:3000 in your browser:

```bash
yarn install
yarn start
```

## Minimal

http://localhost:3000/minimal

This is just the minimal example with only the required props set.

## Preload

http://localhost:3000/preload

This is a side by side example to show the difference while scrolling with and without preloading of rows.
Make sure that all images have been loaded at least once and in cache.

## Gap and Padding

http://localhost:3000/gapandpadding

This shows the the grid with a padding around and a gap between the rows/columns.

## Square

http://localhost:3000/square

This example demonstrates to enforce square items using a custom class with a CSS trick.
This works by adding an pseudo element to the grid with a `padding-bottom` of 100% which results in a square element.

```css
.squared:before {
    content: "";
    grid-row-start: 1;
    grid-column-start: 1;
    padding-bottom: 100%;
}
```

## Controlled

http://localhost:3000/controlled

This example allows you to update some of the props on the fly.
