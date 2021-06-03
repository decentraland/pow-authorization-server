import { createLogComponent } from '@well-known-components/logger'
import { obtainChallengeHandler, verifyChallengeHandler } from '../../../src/controllers/handlers/challenge-handler'
import * as logicChallenge from '../../../src/logic/challenge'
import * as cookie from '../../../src/logic/cookie'
import * as jwt from '../../../src/logic/jwt'
import { generateSigningKeys, SigningKeys } from '../../../src/logic/key-generator'
import * as cacheModule from '../../../src/ports/cache'
import { AppComponents } from '../../../src/types'

describe('challenge-controller-unit', () => {
  let keys: SigningKeys
  const cache = cacheModule.createCache()
  const logs = createLogComponent()

  beforeEach(() => {
    keys = generateSigningKeys()
  })

  describe('getting a new challenge', () => {
    it('must return complexity 4', async () => {
      const response = await obtainChallengeHandler({
        components: { cache, logs }
      } as any)

      expect((response.body as any).complexity).toEqual(4)
      expect(response.status).toEqual(200)
    })

    it('must return a random challenge', async () => {
      const response = await obtainChallengeHandler({
        components: { cache, logs }
      } as any)

      expect((response.body as any).challenge).toBeDefined()
      expect(response.status).toEqual(200)
    })
  })

  describe('validating a challenge', () => {
    let cacheGetSpy: jest.SpyInstance
    const challenge = 'a'

    beforeEach(() => {
      cacheGetSpy = jest.spyOn(cache, 'get')
      cacheGetSpy.mockReturnValue(challenge)
    })

    afterEach(() => {
      cacheGetSpy.mockRestore()
    })

    it('when invalid must return 401', async () => {
      const spy = jest.spyOn(logicChallenge, 'isValidChallenge')
      spy.mockReturnValue(Promise.resolve(false))

      const r = {
        clone: () => ({
          json: () => Promise.resolve({ complexity: 1, challenge, nonce: 'b' })
        })
      }

      const response = await verifyChallengeHandler({
        request: r,
        components: { keys, cache, logs } as any
      } as any)

      expect(response.status).toEqual(401)
      expect(response.body).toContain('Invalid Challenge')
    })

    it('when valid must return a jwt', async () => {
      const spy = jest.spyOn(logicChallenge, 'isValidChallenge')
      spy.mockReturnValue(Promise.resolve(true))

      const signJWTSpy = jest.spyOn(jwt, 'signJWT')
      signJWTSpy.mockReturnValue('aJwt')

      const getCookieSpy = jest.spyOn(cookie, 'getCookieHeader')
      const aCookie = { 'Set-Cookie': 'aCookie' }
      getCookieSpy.mockReturnValue(aCookie)

      const r = {
        clone: () => ({
          json: () => Promise.resolve({ complexity: 1, challenge, nonce: 'b' })
        })
      }

      const response = await verifyChallengeHandler({
        request: r,
        components: { keys, cache, logs } as Partial<AppComponents>
      } as any)

      expect(response.status).toEqual(200)
      expect((response.body as any).jwt).toEqual('aJwt')
      expect(response.headers as any).toEqual(expect.objectContaining(aCookie))
    })
  })
})
