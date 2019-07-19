import * as React from "react"
import { ChangeEvent, useCallback, useState } from "react"
import { Kitten, KittenProps } from "./Kitten"
import "./controls.css"
import { Grid } from "react-virtualized-css-grid"

const INITIAL_ITEM_COUNT = 40

export const generateItems = (count: number): KittenProps[] => {
  const items: KittenProps[] = []
  for (let i = 0; i < count; i++) {
    items.push({ width: Math.floor(Math.random() * 600 + 200), height: Math.floor(Math.random() * 400 + 200) })
  }
  return items
}

export const Controls: React.FC = () => {
  const [items, setItems] = useState<KittenProps[]>(generateItems(INITIAL_ITEM_COUNT))
  const [padding, setPadding] = useState<number>(5)
  const [gap, setGap] = useState<number>(10)
  const [isSquare, setIsSquare] = useState<boolean>(false)
  const [preload, setPreload] = useState<number>(0)

  const handleUpdateItems = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const newCount = Number(event.target.value)
    if (newCount > items.length) {
      setItems(items.concat(generateItems(newCount - items.length)))
    }
    if (newCount < items.length) {
      setItems(items.slice(0, newCount))
    }
  }, [items])

  const handleUpdatePadding = (event: ChangeEvent<HTMLInputElement>) => {
    setPadding(Number(event.target.value))
  }

  const handleUpdateGap = (event: ChangeEvent<HTMLInputElement>) => {
    setGap(Number(event.target.value))
  }

  const handleUpdateIsSquare = (event: ChangeEvent<HTMLInputElement>) => {
    setIsSquare(event.target.checked)
  }

  const handleUpdatePreload = (event: ChangeEvent<HTMLInputElement>) => {
    setPreload(Number(event.target.value))
  }

  return <div className={"container"}>
    <div className={"controls"}>
      <label htmlFor={"count"}>Item Count:</label>
      <input id={"count"} type="number" value={items.length} onChange={handleUpdateItems}/>
      <label htmlFor={"padding"}>Padding:</label>
      <input id={"padding"} type="number" value={padding} onChange={handleUpdatePadding} min={0}/>
      <label htmlFor={"gap"}>Grid Gap:</label>
      <input id={"gap"} type="number" value={gap} onChange={handleUpdateGap} min={0}/>
      <label htmlFor={"preload"}>Preload Rows:</label>
      <input id={"preload"} type="number" value={preload} onChange={handleUpdatePreload} min={0}/>
      <label htmlFor={"isSquare"}>Square Items:</label>
      <input id={"isSquare"} type="checkbox" checked={isSquare}
             onChange={handleUpdateIsSquare}/>

    </div>
    <Grid<KittenProps>
      className={isSquare ? "square" : undefined}
      Item={Kitten}
      items={items}
      padding={padding}
      preload={preload}
      gridGap={gap}
      minItemHeight={300}
      minItemWidth={300}
    />
  </div>
}
