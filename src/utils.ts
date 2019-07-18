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
