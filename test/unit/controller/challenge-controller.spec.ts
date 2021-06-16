import { IConfigComponent, IHttpServerComponent } from '@well-known-components/interfaces'
import { createLogComponent } from '@well-known-components/logger'
import { obtainChallengeHandler, verifyChallengeHandler } from '../../../src/controllers/handlers/challenge-handler'
import * as logicChallenge from '../../../src/logic/challenge'
import { createAndInitializeConfigComponent, parseRangesVariables } from '../../../src/logic/componentsUtils'
import * as cookie from '../../../src/logic/cookie'
import * as jwt from '../../../src/logic/jwt'
import { generateSigningKeys, SigningKeys } from '../../../src/logic/key-generator'
import * as cacheModule from '../../../src/ports/cache'
import { AppComponents, COMPLEXITY_RANGES_VARIABLE } from '../../../src/types'

describe('challenge-controller-unit', () => {
  let keys: SigningKeys
  let emittedCache: cacheModule.InMemoryCache
  let solvedCache: cacheModule.InMemoryCache
  const logs = createLogComponent()
  let config: IConfigComponent
  let complexityRanges: Record<number, number>

  beforeEach(async () => {
    keys = generateSigningKeys()
    config = await createAndInitializeConfigComponent()
    complexityRanges = parseRangesVariables((await config.getString(COMPLEXITY_RANGES_VARIABLE)) || '')
    emittedCache = cacheModule.createCache()
    solvedCache = cacheModule.createCache()
  })

  describe('getting a new challenge', () => {
    it('must return complexity 4', async () => {
      const response = await obtainChallengeHandler({
        components: { emittedCache, solvedCache, logs, config, complexityRanges }
      } as any)

      expect((response.body as any).complexity).toEqual(4)
      expect(response.status).toEqual(200)
    })

    it('must return a random challenge', async () => {
      const response = await obtainChallengeHandler({
        components: { emittedCache, solvedCache, logs, config, complexityRanges }
      } as any)

      expect((response.body as any).challenge).toBeDefined()
      expect(response.status).toEqual(200)
    })

    describe('when the challenge generated already exists', () => {
      let cachePutSpy: jest.SpyInstance
      let emittedIsPresentSpy: jest.SpyInstance
      let solvedIsPresentSpy: jest.SpyInstance

      beforeEach(async () => {
        cachePutSpy = jest.spyOn(emittedCache, 'put').mockReturnValueOnce({} as any)
        emittedIsPresentSpy = jest.spyOn(emittedCache, 'isPresent').mockReturnValueOnce(true).mockReturnValueOnce(false)
        solvedIsPresentSpy = jest
          .spyOn(solvedCache, 'isPresent')
          .mockReturnValueOnce(true)
          .mockReturnValueOnce(true)
          .mockReturnValueOnce(false)

        await obtainChallengeHandler({
          components: { emittedCache, solvedCache, logs, config, complexityRanges }
        } as any)
      })

      afterEach(() => {
        cachePutSpy.mockRestore()
        emittedIsPresentSpy.mockRestore()
        solvedIsPresentSpy.mockRestore()
      })

      it('should call check if the key is present three times', () => {
        console.log(emittedIsPresentSpy.mock.calls)
        expect(emittedIsPresentSpy).toHaveBeenCalledTimes(3)
      })
    })

    describe('when the challenge generated already exists three times', () => {
      let cachePutSpy: jest.SpyInstance
      let emittedIsPresentSpy: jest.SpyInstance
      let solvedIsPresentSpy: jest.SpyInstance
      let response: IHttpServerComponent.IResponse

      beforeEach(async () => {
        cachePutSpy = jest.spyOn(emittedCache, 'put').mockImplementation(() => {
          throw new Error('error')
        })

        emittedIsPresentSpy = jest.spyOn(emittedCache, 'isPresent').mockReturnValue(true)
        solvedIsPresentSpy = jest.spyOn(solvedCache, 'isPresent').mockReturnValue(true)

        response = await obtainChallengeHandler({
          components: { emittedCache, solvedCache, logs, config, complexityRanges }
        } as any)
      })

      afterEach(() => {
        cachePutSpy.mockRestore()
        emittedIsPresentSpy.mockRestore()
        solvedIsPresentSpy.mockRestore()
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
    let cacheDelSpy: jest.SpyInstance
    const challenge = 'a'
    const complexity = 2

    beforeEach(() => {
      cacheGetSpy = jest.spyOn(emittedCache, 'get')
      cacheGetSpy.mockReturnValue(complexity)

      cacheDelSpy = jest.spyOn(emittedCache, 'del')
      cacheDelSpy.mockImplementation(jest.fn())
    })

    afterEach(() => {
      cacheGetSpy.mockRestore()
      cacheDelSpy.mockRestore()
    })

    describe("when it's already solved", () => {
      let solvedIsPresentSpy: jest.SpyInstance

      beforeEach(() => {
        solvedIsPresentSpy = jest.spyOn(solvedCache, 'isPresent').mockReturnValue(true)
      })

      afterEach(() => {
        solvedIsPresentSpy.mockRestore()
      })

      it('should return a 400 with the error message', async () => {
        const r = {
          clone: () => ({
            json: () => Promise.resolve({ complexity, challenge, nonce: 'b' })
          })
        }

        const response = await verifyChallengeHandler({
          request: r,
          components: { keys, emittedCache, solvedCache, logs, config } as any
        } as any)

        expect(response.status).toEqual(400)
        expect(response.body).toContain('Invalid Challenge, the challenge was already solved')
      })
    })

    describe("when the complexity doesn't match", () => {
      let matchesComplexitySpy: jest.SpyInstance
      let response: IHttpServerComponent.IResponse
      let solvedIsPresentSpy: jest.SpyInstance
      let emittedIsPresentSpy: jest.SpyInstance

      beforeEach(async () => {
        matchesComplexitySpy = jest.spyOn(logicChallenge, 'matchesComplexity')
        matchesComplexitySpy.mockReturnValue(false)
        solvedIsPresentSpy = jest.spyOn(solvedCache, 'isPresent').mockReturnValue(false)
        emittedIsPresentSpy = jest.spyOn(emittedCache, 'isPresent').mockReturnValue(true)

        const r = {
          clone: () => ({
            json: () => Promise.resolve({ complexity, challenge, nonce: 'b' })
          })
        }

        response = await verifyChallengeHandler({
          request: r,
          components: { keys, emittedCache, solvedCache, logs, config } as any
        } as any)
      })

      afterEach(() => {
        matchesComplexitySpy.mockRestore()
        solvedIsPresentSpy.mockRestore()
        emittedIsPresentSpy.mockRestore()
      })

      it('should return 400 with the expected error message', () => {
        expect(response.status).toEqual(400)
        expect(response.body).toContain('The complexity does not match the expected one')
      })
    })

    describe('when the complexity does match', () => {
      let matchesComplexitySpy: jest.SpyInstance
      let emittedIsPresentSpy: jest.SpyInstance
      let solvedIsPresentSpy: jest.SpyInstance

      beforeEach(async () => {
        matchesComplexitySpy = jest.spyOn(logicChallenge, 'matchesComplexity')
        matchesComplexitySpy.mockReturnValue(true)

        emittedIsPresentSpy = jest.spyOn(emittedCache, 'isPresent').mockReturnValue(true)
        solvedIsPresentSpy = jest.spyOn(solvedCache, 'isPresent').mockReturnValue(false)
      })

      afterEach(() => {
        matchesComplexitySpy.mockRestore()
        emittedIsPresentSpy.mockRestore()
        solvedIsPresentSpy.mockRestore()
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
          components: { keys, emittedCache, solvedCache, logs, config } as any
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
          components: { keys, emittedCache, solvedCache, logs } as Partial<AppComponents>
        } as any)

        expect(response.status).toEqual(200)
        expect(cacheDelSpy).toHaveBeenCalledWith(challenge)
        expect((response.body as any).jwt).toEqual('aJwt')
        expect(response.headers as any).toEqual(expect.objectContaining(aCookie))
      })
    })
  })
})
