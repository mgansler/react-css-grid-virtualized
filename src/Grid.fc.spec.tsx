import * as React from "react"
import { GridFc } from "./Grid.fc"
import { GridPosition, GridProps } from "./types"
import ReactDOM from "react-dom"
import { sleep } from "./testUtils"

interface MockItemProps {
  id: number
}

const MockItem: React.FC<MockItemProps & GridPosition> = ({ gridColumnStart, gridRowStart, id }) => <div
  style={{ gridColumnStart, gridRowStart, width: 250, height: 250 }}>{id}|{gridColumnStart}|{gridRowStart}</div>

const getMockItemIds = (nodes: NodeListOf<ChildNode>): number[] => {
  const ids: number[] = []
  nodes.forEach(node => {
    ids.push(Number(node.textContent!.split("|")[0]))
  })
  return ids
}

const mockItems = [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }]

const container = document.createElement("div")

interface ContainerOptions {
  scrollContainerHeight: number
  scrollContainerWidth: number
  scrollTop: number
  gridHeight: number
  gridWidth: number
}

const renderGrid = ({ items = mockItems, Item = MockItem, minItemHeight = 250, minItemWidth = 250, scrollContainerHeight = 500, scrollContainerWidth = 500, scrollTop = 0, gridHeight = 1250, gridWidth = 500, padding = 0, gridGap = 0, preload = 0 }: Partial<GridProps<MockItemProps> & ContainerOptions>) => {
  ReactDOM.render(
    <GridFc<MockItemProps>
      items={items}
      Item={Item}
      minItemHeight={minItemHeight}
      minItemWidth={minItemWidth}
      padding={padding}
      gridGap={gridGap}
      preload={preload}
    />,
    container,
  )

  const scrollContainer = container.childNodes.item(0) as Element
  scrollContainer.getBoundingClientRect = () => ({
    height: scrollContainerHeight,
    width: scrollContainerWidth,
    top: 0,
    left: 0,
    bottom: scrollContainerHeight,
    right: scrollContainerWidth,
  })
  jest.spyOn(scrollContainer, "scrollTop", "get").mockImplementation(() => scrollTop)

  const grid = scrollContainer.childNodes.item(0) as Element
  grid.getBoundingClientRect = () => ({
    height: gridHeight,
    width: gridWidth,
    top: 0,
    left: 0,
    bottom: gridHeight,
    right: gridWidth,
  })

  jest.spyOn(grid, "scrollHeight", "get").mockImplementation(() => gridHeight)
  return { grid, scrollContainer }
}

afterEach(() => {
  ReactDOM.unmountComponentAtNode(container)
})

describe("number of children", () => {
  describe("initial", () => {
    it("should render the correct initial amount of children", async () => {
      const { grid } = renderGrid({})
      await sleep(0)

      expect(grid.childNodes.length).toBe(4)
      expect(getMockItemIds(grid.childNodes)).toEqual([0, 1, 2, 3])
    })

    it("should render the first row only", async () => {
      const { grid } = renderGrid({ scrollContainerHeight: 250 })
      await sleep(0)

      expect(grid.childNodes.length).toBe(2)
      expect(getMockItemIds(grid.childNodes)).toEqual([0, 1])
    })

    it("should render the first row only (single column)", async () => {
      const { grid } = renderGrid({
        scrollContainerHeight: 250,
        scrollContainerWidth: 500 - 1,
        gridHeight: 2500,
        gridWidth: 500 - 1,
      })
      await sleep(0)

      expect(grid.childNodes.length).toBe(1)
      expect(getMockItemIds(grid.childNodes)).toEqual([0])
    })
  })

  describe("scrolling", () => {
    it("should render the first six items when scrolled down half a row", async () => {
      const { grid } = renderGrid({
        scrollTop: 250 / 2,
      })
      await sleep(0)

      expect(grid.childNodes.length).toBe(6)
      expect(getMockItemIds(grid.childNodes)).toEqual([0, 1, 2, 3, 4, 5])
    })

    it("should render the last three items when scrolled to the bottom", async () => {
      const { grid } = renderGrid({
        scrollTop: 1250 - 500,
      })
      await sleep(0)

      expect(grid.childNodes.length).toBe(3)
      expect(getMockItemIds(grid.childNodes)).toEqual([6, 7, 8])
    })

    it("should render the last three items when scrolled to the bottom (single row)", async () => {
      const { grid } = renderGrid({
        scrollContainerHeight: 250,
        scrollTop: 1250 - 250,
      })
      await sleep(0)

      expect(grid.childNodes.length).toBe(3)
      expect(getMockItemIds(grid.childNodes)).toEqual([6, 7, 8])
    })
  })

  describe("preload", () => {
    it("should render the first six items with preload of 1", async () => {
      const { grid } = renderGrid({
        preload: 1,
      })
      await sleep(0)

      expect(grid.childNodes.length).toBe(6)
      expect(getMockItemIds(grid.childNodes)).toEqual([0, 1, 2, 3, 4, 5])
    })

    it("should render the last five items with preload of 1", async () => {
      const { grid } = renderGrid({
        scrollTop: 1250 - 500,
        preload: 1,
      })
      await sleep(0)

      expect(grid.childNodes.length).toBe(5)
      expect(getMockItemIds(grid.childNodes)).toEqual([4, 5, 6, 7, 8])
    })

    it("should render all items with preload of 1 and scrolled to the middle", async () => {
      const { grid } = renderGrid({
        scrollTop: (1250 - 500) / 2,
        preload: 1,
      })
      await sleep(0)

      expect(grid.childNodes.length).toBe(9)
      expect(getMockItemIds(grid.childNodes)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
    })

    it("should render all items with preload of 10", async () => {
      const { grid } = renderGrid({
        preload: 10,
      })
      await sleep(0)

      expect(grid.childNodes.length).toBe(9)
      expect(getMockItemIds(grid.childNodes)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
    })
  })
})

describe("props validation", () => {
  let consoleWarnSpy: jest.SpyInstance

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(global.console, "warn")
  })

  afterEach(() => {
    consoleWarnSpy.mockClear()
  })

  it("should fail to render given an invalid minItemWidth", () => {
    expect(() => {
      GridFc({ items: [], Item: MockItem, minItemHeight: 1, minItemWidth: 0 })
    }).toThrow("minItemWidth must be a positive number")
  })

  it("should fail to render given an invalid minItemHeight", () => {
    expect(() => {
      GridFc({ items: [], Item: MockItem, minItemHeight: 0, minItemWidth: 1 })
    }).toThrow("minItemHeight must be a positive number")
  })

  it("should fail to render given an invalid preload", () => {
    expect(() => {
      GridFc({ items: [], Item: MockItem, minItemHeight: 1, minItemWidth: 1, preload: -1 })
    }).toThrow("preload must be at least zero")
  })

  it("should warn & render the correct initial amount of children given negative padding", async () => {
    consoleWarnSpy.mockImplementation(jest.fn)
    const { grid } = renderGrid({ padding: -1000 })
    await sleep(0)

    expect(grid.childNodes.length).toBe(4)
    expect(getMockItemIds(grid.childNodes)).toEqual([0, 1, 2, 3])
    expect(consoleWarnSpy).toHaveBeenCalledWith("padding of -1000 is an invalid value, using 0 instead")
  })

  it("should warn & render the correct initial amount of children given negative gap", async () => {
    consoleWarnSpy.mockImplementation(jest.fn)
    const { grid } = renderGrid({ gridGap: -1000 })
    await sleep(0)

    expect(grid.childNodes.length).toBe(4)
    expect(getMockItemIds(grid.childNodes)).toEqual([0, 1, 2, 3])
    expect(consoleWarnSpy).toHaveBeenCalledWith("gridGap of -1000 is an invalid value, using 0 instead")
  })
})

describe("props update", () => {
  it("should add an item", async () => {
    const { grid } = renderGrid({ items: [{ id: 0 }] })
    await sleep(0)

    expect(grid.childNodes.length).toBe(1)
    expect(getMockItemIds(grid.childNodes)).toEqual([0])

    // update
    renderGrid({ items: [{ id: 0 }, { id: 1 }] })
    await sleep(0)

    expect(grid.childNodes.length).toBe(2)
    expect(getMockItemIds(grid.childNodes)).toEqual([0, 1])
  })

  it("should remove an item", async () => {
    const { grid } = renderGrid({ items: [{ id: 0 }] })
    await sleep(0)

    expect(grid.childNodes.length).toBe(1)
    expect(getMockItemIds(grid.childNodes)).toEqual([0])

    // update
    renderGrid({ items: [] })
    await sleep(0)

    expect(grid.childNodes.length).toBe(0)
    expect(getMockItemIds(grid.childNodes)).toEqual([])
  })

  it("should increase padding", async () => {
    const { grid } = renderGrid({ padding: 0, gridHeight: 5 * 250 })
    await sleep(0)

    expect(grid.childNodes.length).toBe(4)
    expect(getMockItemIds(grid.childNodes)).toEqual([0, 1, 2, 3])

    // render with updated props => was 2 columns, will be 1
    renderGrid({ padding: 5, gridHeight: 5 * 250 + 2 * 5 })
    await sleep(0)
    // recalculate visible items after render
    renderGrid({ padding: 5, gridHeight: 9 * 250 + 2 * 5 })
    await sleep(0)

    expect(grid.childNodes.length).toBe(2)
    expect(getMockItemIds(grid.childNodes)).toEqual([0, 1])
  })

  it("should decrease padding", async () => {
    const { grid } = renderGrid({ padding: 5, gridHeight: 9 * 250 + 2 * 5 })
    await sleep(0)

    expect(grid.childNodes.length).toBe(2)
    expect(getMockItemIds(grid.childNodes)).toEqual([0, 1])

    // render with updated props => was 1 column, will be 2
    renderGrid({ padding: 0, gridHeight: 9 * 250 })
    await sleep(0)
    // recalculate visible items after render
    renderGrid({ padding: 0, gridHeight: 5 * 250 })
    await sleep(0)

    expect(grid.childNodes.length).toBe(4)
    expect(getMockItemIds(grid.childNodes)).toEqual([0, 1, 2, 3])
  })

  it("should increase gap", async () => {
    const { grid } = renderGrid({ gridGap: 0, gridHeight: 5 * 250 })
    await sleep(0)

    expect(grid.childNodes.length).toBe(4)
    expect(getMockItemIds(grid.childNodes)).toEqual([0, 1, 2, 3])

    // render with updated props => was 2 columns, will be 1
    renderGrid({ gridGap: 10, gridHeight: 5 * 250 + 4 * 10 })
    await sleep(0)
    // recalculate visible items after render
    renderGrid({ gridGap: 10, gridHeight: 9 * 250 + 8 * 10 })
    await sleep(0)

    expect(grid.childNodes.length).toBe(2)
    expect(getMockItemIds(grid.childNodes)).toEqual([0, 1])
  })

  it("should decrease gap", async () => {
    const { grid } = renderGrid({ gridGap: 10, gridHeight: 9 * 250 + 8 * 10 })
    await sleep(0)

    expect(grid.childNodes.length).toBe(2)
    expect(getMockItemIds(grid.childNodes)).toEqual([0, 1])

    // render with updated props => was 1 column, will be 2
    renderGrid({ gridGap: 0, gridHeight: 9 * 250 })
    await sleep(0)
    // recalculate visible items after render
    renderGrid({ gridGap: 0, gridHeight: 5 * 250 })
    await sleep(0)

    expect(grid.childNodes.length).toBe(4)
    expect(getMockItemIds(grid.childNodes)).toEqual([0, 1, 2, 3])
  })
})
