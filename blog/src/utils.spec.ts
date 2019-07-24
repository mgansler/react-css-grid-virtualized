import { range, throttle } from "./utils"

describe("range", () => {
  test.each`
  from | to   | expected
  ${0} | ${0} | ${[]}
  ${1} | ${1} | ${[]}
  ${0} | ${1} | ${[0]}
  ${7} | ${3} | ${[]}
  ${3} | ${7} | ${[3, 4, 5, 6]}
`("should return the expected range $expected", ({ from, to, expected }) => {
    expect(range(from, to)).toEqual(expected)
  })
})

describe("throttle", () => {
  const sleep = (delay: number) => new Promise(resolve => setTimeout(resolve, delay))

  let mockFn: jest.Mock
  let throttled: Function

  beforeEach(() => {
    mockFn = jest.fn()
    throttled = throttle(mockFn, 50)
  })

  it("should call function once", async () => {
    throttled()
    await sleep(200)

    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it("should call function again after delay", async () => {
    throttled()
    setTimeout(throttled, 100)

    await sleep(200)

    expect(mockFn).toHaveBeenCalledTimes(2)
  })

  it("should skip a delayed call", async () => {
    throttled()
    setTimeout(throttled, 20)

    await sleep(200)

    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it("should always catch last call", async () => {
    throttled(1)
    setTimeout(() => throttled(2), 20)
    setTimeout(() => throttled(3), 40)
    setTimeout(() => throttled(4), 60)
    setTimeout(() => throttled(5), 80)

    await sleep(200)

    expect(mockFn).toHaveBeenCalledTimes(2)
    
    expect(mockFn.mock.calls[0][0]).toBe(3)
    expect(mockFn.mock.calls[1][0]).toBe(5)
  })
})
