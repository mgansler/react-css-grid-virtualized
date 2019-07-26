# React Virtualized CSS Grid

This library is for showing one-dimensional data in a two-dimensional way, at least for now.

## Quick Start

```bash
yarn add react-virtualized-css-grid
```

Plain JavaScript:

```javascript
import Grid from "react-virtualized-css-grid"

// `id` is a placeholder for your item props
function ItemComponent({ gridColumnStart, gridRowStart, id }) {
  return <div style={{ gridColumnStart, gridRowStart }}>{id}</div>
}

const data = [{ id: 1 }, { id: 2 }]

function YourComponent() {
  return (
    <Grid Item={ItemComponent} items={data} minItemWidth={300} minItemHeight={300}/>
  )
}
```

TypeScript:

```typescript jsx
import Grid, { GridPosition } from "react-virtualized-css-grid"

interface ItemProps {
  id: number
}

const ItemComponent: React.FC<ItemProps & GridPosition> = ({ gridColumnStart, gridRowStart, id }) => {
  return <div style={{ gridColumnStart, gridRowStart }}>{id}</div>
}

const data: ItemProps[] = [{ id: 1 }, { id: 2 }]

function YourComponent() {
  return (
    <Grid<ItemProps> Item={ItemComponent} items={data}/>
  )
}
```

## Props

name | type | required | default value | description
--- | --- | --- | --- | ---
`className` | string | no | "" | CSS class(es) to be attached to the grid
`Item` | React.FC<T & GridPosition> | yes | - | The component used to render the items
`items` | T[] | yes | - | The data to be rendered
`minItemHeight` | number | no | 0 | The items won't be smaller than this
`minItemWidth` | number | no | 0 | The items won't be narrower than this
`gridGap` | number | no | 0 | The space between rows and columns
`padding` | number | no | 0 | The space around the outmost items
`preload` | number | no | 0 | The number of rows rendered before/after the visible area

## Examples

See [EXAMPLES.md](examples/EXAMPLES.md)
