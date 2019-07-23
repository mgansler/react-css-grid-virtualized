import { GridState } from "./Grid"

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


export const range = (from: number, to: number): number[] => {
  let range: number[] = []
  for (let i = 0; i < to - from; i++) {
    range[i] = from + i
  }
  return range
}

export const throttle = (func: (...args: any[]) => void, intervalLength: number) => {
  let intervalBegin = 0
  let handle: number

  return (...args: any[]) => {
    let timeout = intervalLength
    const now = Date.now()

    if (now - intervalBegin > intervalLength) {
      intervalBegin = now
    } else {
      window.clearTimeout(handle)
      timeout = intervalLength - (now - intervalBegin)
    }

    handle = window.setTimeout(func, timeout, ...args)
  }
}

export const isPositiveNumber = (number: number) => (isFinite(number) && number > 0)

export const isPositiveNumberOrZero = (number: number) => (isFinite(number) && number >= 0)
