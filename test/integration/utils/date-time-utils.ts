export function inNext7Days(fromTimestamp: number): number {
  return new Date(fromTimestamp + 7 * 24 * 3600 * 1000).getTime()
}

export function verifyDateIsCloseTo(firstDate: number, closeBeforeDate: number, closeAfterDate: number): void {
  expect(firstDate).toBeGreaterThanOrEqual(closeBeforeDate)
  expect(firstDate).toBeLessThanOrEqual(closeAfterDate)
}
