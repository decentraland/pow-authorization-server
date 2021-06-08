import { IConfigComponent, IHttpServerComponent } from '@well-known-components/interfaces'
import { createLogComponent } from '@well-known-components/logger'
import { obtainChallengeHandler, verifyChallengeHandler } from '../../../src/controllers/handlers/challenge-handler'
import * as logicChallenge from '../../../src/logic/challenge'
import { createAndInitializeConfigComponent } from '../../../src/logic/componentsUtils'
import * as cookie from '../../../src/logic/cookie'
import * as jwt from '../../../src/logic/jwt'
import { generateSigningKeys, SigningKeys } from '../../../src/logic/key-generator'
import * as cacheModule from '../../../src/ports/cache'
import { AppComponents } from '../../../src/types'

describe('challenge-controller-unit', () => {
  let keys: SigningKeys
  let cache: cacheModule.InMemoryCache
  const logs = createLogComponent()
  let config: IConfigComponent

  beforeEach(async () => {
    keys = generateSigningKeys()
    config = await createAndInitializeConfigComponent()
    cache = await cacheModule.createAndInitializeCache(config)
  })

  describe('getting a new challenge', () => {
    it('must return complexity 4', async () => {
      const response = await obtainChallengeHandler({
        components: { cache, logs, config }
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

    describe('when the challenge generated already exists', () => {
      let cachePutSpy: jest.SpyInstance

      beforeEach(async () => {
        cachePutSpy = jest
          .spyOn(cache, 'put')
          .mockImplementationOnce(() => {
            throw new Error('error')
          })
          .mockReturnValueOnce({} as any)

        await obtainChallengeHandler({
          components: { cache, logs }
        } as any)
      })

      afterEach(() => {
        cachePutSpy.mockRestore()
      })

      it('should call cache twice', () => {
        expect(cachePutSpy).toHaveBeenCalledTimes(2)
      })
    })

    describe('when the challenge generated already exists three times', () => {
      let cachePutSpy: jest.SpyInstance
      let response: IHttpServerComponent.IResponse

      beforeEach(async () => {
        cachePutSpy = jest.spyOn(cache, 'put').mockImplementation(() => {
          throw new Error('error')
        })

        response = await obtainChallengeHandler({
          components: { cache, logs }
        } as any)
      })

      afterEach(() => {
        cachePutSpy.mockRestore()
      })

      it('should call return a 500', () => {
        expect(response.status).toEqual(500)
      })

      it("should call return a message saying it couldn't generate the challenge", () => {
        expect(response.body).toEqual("Couldn't generate a valid challenge please try again")
      })
    })
  })

  describe('validating a challenge', () => {
    let cacheGetSpy: jest.SpyInstance
    const challenge = 'a'
    const complexity = 2

    beforeEach(() => {
      cacheGetSpy = jest.spyOn(cache, 'get')
      cacheGetSpy.mockReturnValue(complexity)
    })

    afterEach(() => {
      cacheGetSpy.mockRestore()
    })

    describe("when the complexity doesn't match", () => {
      let matchesComplexitySpy: jest.SpyInstance
      let response: IHttpServerComponent.IResponse

      beforeEach(async () => {
        matchesComplexitySpy = jest.spyOn(logicChallenge, 'matchesComplexity')
        matchesComplexitySpy.mockReturnValue(false)

        const r = {
          clone: () => ({
            json: () => Promise.resolve({ complexity, challenge, nonce: 'b' })
          })
        }

        response = await verifyChallengeHandler({
          request: r,
          components: { keys, cache, logs, config } as any
        } as any)
      })

      afterEach(() => {
        matchesComplexitySpy.mockRestore()
      })

      it('should return 400', () => {
        expect(response.status).toEqual(400)
      })
    })

    describe('when the complexity does match', () => {
      let matchesComplexitySpy: jest.SpyInstance

      beforeEach(async () => {
        matchesComplexitySpy = jest.spyOn(logicChallenge, 'matchesComplexity')
        matchesComplexitySpy.mockReturnValue(true)
      })

      afterEach(() => {
        matchesComplexitySpy.mockRestore()
      })

      it('when invalid must return 401', async () => {
        const spy = jest.spyOn(logicChallenge, 'isValidChallenge')
        spy.mockReturnValue(Promise.resolve(false))

        const r = {
          clone: () => ({
            json: () => Promise.resolve({ complexity, challenge, nonce: 'b' })
          })
        }

        const response = await verifyChallengeHandler({
          request: r,
          components: { keys, cache, logs, config } as any
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
})
