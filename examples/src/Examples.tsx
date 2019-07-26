import React from "react"
import { Kitten, KittenProps } from "./Kitten"
import "./examples.css"
import Grid from "react-css-grid-virtualized"

const INITIAL_KITTEN_COUNT = 40

const generateKittens = (count: number): KittenProps[] => {
  const kittens: KittenProps[] = []
  for (let i = 0; i < count; i++) {
    kittens.push({ width: Math.floor(Math.random() * 600 + 200), height: Math.floor(Math.random() * 400 + 200) })
  }
  return kittens
}

export const Minimal: React.FC = () => {
  return (
    <Grid<KittenProps> Item={Kitten} items={generateKittens(INITIAL_KITTEN_COUNT)} minItemHeight={300}
                       minItemWidth={300}/>
  )
}

export const Preload: React.FC = () => {
  const kittens = generateKittens(INITIAL_KITTEN_COUNT)
  return (
    <div className={"sideBySide"}>
      <div className={"column left"}>
        <span className={"header"}>No Preload</span>
        <Grid<KittenProps> Item={Kitten} items={kittens} minItemHeight={200} minItemWidth={200} preload={0}/>
      </div>
      <div className={"column right"}>
        <span className={"header"}>2 Rows Preload</span>
        <Grid<KittenProps> Item={Kitten} items={kittens} minItemHeight={200} minItemWidth={200} preload={2}/>
      </div>
    </div>
  )
}

export const GapAndPadding: React.FC = () => {
  return (
    <Grid<KittenProps> Item={Kitten} items={generateKittens(INITIAL_KITTEN_COUNT)} minItemHeight={300}
                       minItemWidth={300} gridGap={10} padding={5}/>
  )
}

export const SquareItems: React.FC = () => {
  return (
    <Grid<KittenProps> Item={Kitten} items={generateKittens(INITIAL_KITTEN_COUNT)} minItemHeight={300}
                       minItemWidth={300} className={"squared"}/>
  )
}

export const Controlled: React.FC = () => {
  const [kittens, setKittens] = React.useState<KittenProps[]>(generateKittens(INITIAL_KITTEN_COUNT))
  const [padding, setPadding] = React.useState<number>(5)
  const [gap, setGap] = React.useState<number>(10)
  const [isSquare, setIsSquare] = React.useState<boolean>(false)
  const [preload, setPreload] = React.useState<number>(0)

  const handleUpdateItems = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newCount = Number(event.target.value)
    if (newCount > kittens.length) {
      setKittens(kittens.concat(generateKittens(newCount - kittens.length)))
    }
    if (newCount < kittens.length) {
      setKittens(kittens.slice(0, newCount))
    }
  }, [kittens])

  const handleUpdatePadding = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPadding(Number(event.target.value))
  }

  const handleUpdateGap = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGap(Number(event.target.value))
  }

  const handleUpdateIsSquare = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsSquare(event.target.checked)
  }

  const handleUpdatePreload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPreload(Number(event.target.value))
  }

  return <div className={"container"}>
    <div className={"controls"}>
      <label htmlFor={"count"}>Item Count:</label>
      <input id={"count"} type="number" value={kittens.length} onChange={handleUpdateItems}/>

      <label htmlFor={"padding"}>Padding:</label>
      <input id={"padding"} type="number" value={padding} onChange={handleUpdatePadding} min={0}/>

      <label htmlFor={"gap"}>Grid Gap:</label>
      <input id={"gap"} type="number" value={gap} onChange={handleUpdateGap} min={0}/>

      <label htmlFor={"preload"}>Preload Rows:</label>
      <input id={"preload"} type="number" value={preload} onChange={handleUpdatePreload} min={0}/>

      <label htmlFor={"isSquare"}>Square Items:</label>
      <input id={"isSquare"} type="checkbox" checked={isSquare} onChange={handleUpdateIsSquare}/>
    </div>

    <Grid<KittenProps>
      className={isSquare ? "squared" : undefined}
      Item={Kitten}
      items={kittens}
      padding={padding}
      preload={preload}
      gridGap={gap}
      minItemWidth={300}
      minItemHeight={300}
    />
  </div>
}
