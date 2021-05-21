export function currentTimeInMilliseconds(): number {
  return new Date().getTime()
}

export function timeFromString(dateString: string): number {
  return new Date(dateString).getTime()
}

export function inNext7Days(fromTimestamp: number): number {
  return new Date(fromTimestamp + 7 * 24 * 3600 * 1000).getTime()
}
