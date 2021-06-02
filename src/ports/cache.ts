import ms = require('ms')

const DEFAULT_TTL = '1m'

interface CacheRecord<T> {
  value: T
  timeoutId: NodeJS.Timeout
  expirationDate: number
  ttl: string
}

export class InMemoryCache<T = any> {
  public values: Record<string, CacheRecord<T>> = {}

  get(key: string, refreshCache: boolean = true): T {
    if (!this.values[key]) {
      throw new Error('Key was not found')
    }

    if (refreshCache) {
      clearTimeout(this.values[key].timeoutId)

      const timeoutId = setTimeout(() => this.del(key), ms(this.values[key].ttl))
      this.values[key].timeoutId = timeoutId
    }

    return this.values[key].value
  }

  put(key: string, value: T, ttl: string = DEFAULT_TTL): void {
    const expirationDate = Date.now() + ms(ttl)
    const timeoutId = setTimeout(() => this.del(key), ms(ttl))
    this.values[key] = {
      value,
      expirationDate,
      timeoutId,
      ttl
    }
  }

  del(key: string): void {
    if (!this.values[key]) {
      throw new Error('Key not found')
    }

    clearTimeout(this.values[key].timeoutId)
    delete this.values[key]
  }
}

export function createCache(): InMemoryCache {
  return new InMemoryCache()
}
