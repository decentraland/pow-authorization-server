import ms = require('ms')

const DEFAULT_TTL = '1m'

interface CacheRecord<T> {
  value: T
  timeoutId: NodeJS.Timeout
  ttl: string
}

export class InMemoryCache<T = any> {
  values: Record<string, CacheRecord<T>> = {}

  getKeyCount(): number {
    return Object.keys(this.values).length
  }

  put(key: string, value: T, ttl: string = DEFAULT_TTL): CacheRecord<T> {
    if (this.values[key] != null) {
      throw new Error(`The key ${key} already exists`)
    }

    const timeoutId = setTimeout(() => {
      try {
        this.del(key)
      } catch {}
    }, ms(ttl))

    const cacheRecord: CacheRecord<T> = {
      value,
      timeoutId,
      ttl
    }

    this.values[key] = cacheRecord

    return cacheRecord
  }

  isPresent(key: string): boolean {
    return !!this.values[key]
  }

  get(key: string, refreshCache: boolean = true): T {
    if (!this.values[key]) {
      throw new Error(`The key ${key} was not found`)
    }

    if (refreshCache) {
      clearTimeout(this.values[key].timeoutId)

      const timeoutId = setTimeout(() => {
        try {
          this.del(key)
        } catch {}
      }, ms(this.values[key].ttl))
      this.values[key].timeoutId = timeoutId
    }

    return this.values[key].value
  }

  del(key: string): void {
    if (!this.values[key]) {
      throw new Error(`The key ${key} was not found`)
    }

    clearTimeout(this.values[key].timeoutId)
    delete this.values[key]
  }
}

export function createCache(): InMemoryCache {
  const cache = new InMemoryCache()

  return cache
}
