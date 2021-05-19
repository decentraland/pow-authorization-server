import * as cookie from 'cookie'
import { getCookieHeader } from '../../../src/logic/cookie'

describe('Cookie', () => {
  afterAll(() => {
    jest.resetAllMocks()
  })

  describe('getCookieHeader', () => {
    const signedJWT = 'myValue'
    const serializedJwt = 'My value'
    let spy: jest.SpyInstance

    beforeAll(() => {
      spy = jest.spyOn(cookie, 'serialize')
      spy.mockReturnValue(serializedJwt)
    })

    it('should return the set cookie header with the serialization of the cookie', async () => {
      expect(getCookieHeader(signedJWT)).toEqual({ 'Set-Cookie': serializedJwt })
    })

    it('should call the cookies library with the expected parameters', () => {
      expect(spy.mock.calls).toEqual([['JWT', signedJWT, expect.objectContaining({ expires: expect.any(Date) })]])
    })
  })
})
