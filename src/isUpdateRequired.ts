import { GridState } from "./types"

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
