import { createCache, InMemoryCache } from '../../../src/ports/cache'
import ms = require('ms')

describe('cache', () => {
  let cache: InMemoryCache
  const nonExistentKey = 'lol'

  const key1 = 'aKey'
  const value1 = 'aValue'

  const key2 = 'anotherKey'
  const value2 = 'anotherValue'

  const ttl = '7d'

  let setTimeoutSpy: jest.SpyInstance
  let clearTimeoutSpy: jest.SpyInstance
  const minComplexity = 1
  const minUsers = 2

  describe('adding a key to a cache', () => {
    beforeEach(() => {
      cache = createCache()
      setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation(jest.fn())
      clearTimeoutSpy = jest.spyOn(global, 'clearTimeout').mockImplementation(jest.fn())

      cache.put(key1, value1, ttl)
    })

    afterEach(() => {
      setTimeoutSpy.mockRestore()
      clearTimeoutSpy.mockRestore()
    })

    it('should set timeout to delete the key', () => {
      expect(setTimeoutSpy).toHaveBeenCalledTimes(1)
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), ms(ttl))
    })

    it('should be present in the cache', () => {
      expect(cache.get(key1)).toEqual(value1)
    })
  })

  describe('deleting a key', () => {
    beforeEach(() => {
      setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation(jest.fn())
      clearTimeoutSpy = jest.spyOn(global, 'clearTimeout').mockImplementation(jest.fn())
    })

    afterEach(() => {
      setTimeoutSpy.mockRestore()
      clearTimeoutSpy.mockRestore()
    })

    describe('if the key is not present', () => {
      beforeEach(() => {
        cache = createCache()
      })

      it('should throw an exception', () => {
        expect(() => cache.del(nonExistentKey)).toThrow(Error(`The key ${nonExistentKey} was not found`))
      })
    })

    describe('if the key is present', () => {
      let timeoutId: NodeJS.Timeout

      beforeEach(() => {
        cache = createCache()

        const response = cache.put(key1, value1, ttl)
        timeoutId = response.timeoutId

        cache.del(key1)
      })

      it('should remove the timeout', () => {
        expect(clearTimeoutSpy).toHaveBeenCalledTimes(1)
        expect(clearTimeoutSpy).toHaveBeenCalledWith(timeoutId)
      })

      it('should not be present in the cache', () => {
        expect(() => cache.get(key1)).toThrow(Error(`The key ${key1} was not found`))
      })
    })
  })

  describe('obtaining the value for a key', () => {
    describe('if the key is not present', () => {
      beforeEach(() => {
        setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation(jest.fn())
        clearTimeoutSpy = jest.spyOn(global, 'clearTimeout').mockImplementation(jest.fn())

        cache = createCache()
      })

      afterEach(() => {
        setTimeoutSpy.mockRestore()
        clearTimeoutSpy.mockRestore()
      })

      it('should throw an exception', () => {
        expect(() => cache.get(nonExistentKey)).toThrow(Error(`The key ${nonExistentKey} was not found`))
      })
    })

    describe('if the key is present', () => {
      let value: string

      describe('if it should refresh the cache', () => {
        let timeoutId: NodeJS.Timeout

        beforeEach(() => {
          setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation(jest.fn())
          clearTimeoutSpy = jest.spyOn(global, 'clearTimeout').mockImplementation(jest.fn())

          cache = createCache()
          const response = cache.put(key1, value1, ttl)
          timeoutId = response.timeoutId

          value = cache.get(key1)
        })

        afterEach(() => {
          setTimeoutSpy.mockRestore()
          clearTimeoutSpy.mockRestore()
        })

        it('should remove the timeout', () => {
          expect(clearTimeoutSpy).toHaveBeenCalledTimes(1)
          expect(clearTimeoutSpy).toHaveBeenCalledWith(timeoutId)
        })

        it('should set timeout to delete the cache', () => {
          // the first call is performed in the put, but this test is not asserting over it
          expect(setTimeoutSpy).toHaveBeenCalledTimes(2)
          expect(setTimeoutSpy).toHaveBeenNthCalledWith(2, expect.any(Function), ms(ttl))
        })

        it('should return the value for the key', () => {
          expect(value).toEqual(value1)
        })
      })

      describe('if it should not refresh the cache', () => {
        beforeEach(() => {
          setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation(jest.fn())
          clearTimeoutSpy = jest.spyOn(global, 'clearTimeout').mockImplementation(jest.fn())

          cache = createCache()
          cache.put(key2, value2, ttl)

          value = cache.get(key2, false)
        })

        afterEach(() => {
          setTimeoutSpy.mockRestore()
          clearTimeoutSpy.mockRestore()
        })

        it('should not remove the timeout', () => {
          expect(clearTimeoutSpy).not.toHaveBeenCalled()
        })

        it('should return the value for the key', () => {
          expect(value).toEqual(value2)
        })
      })
    })
  })
})
