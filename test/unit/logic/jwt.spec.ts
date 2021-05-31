import * as jwt from 'jsonwebtoken'
import { SolvedChallenge } from '../../../src/logic/challenge'
import { signJWT } from '../../../src/logic/jwt'

describe('JWT', () => {
  afterAll(() => {
    jest.resetAllMocks()
  })

  describe('signJWT', () => {
    const signedJWT = 'myValue'
    let spy: jest.SpyInstance

    const solved: SolvedChallenge = {
      challenge: 'a challenge',
      complexity: 2,
      nonce: 'nonce'
    }

    const key = 'a private key'
    const passphrase = 'a passphrase'

    beforeAll(() => {
      spy = jest.spyOn(jwt, 'sign')
      spy.mockReturnValue(signedJWT)
    })

    it('should return the signed JWT', async () => {
      expect(signJWT(solved, key, passphrase)).toEqual(signedJWT)
    })

    it('should call the jwt library with the expected parameters', () => {
      expect(spy.mock.calls).toEqual([
        [
          {
            ...solved
          },
          { key, passphrase },
          { algorithm: 'RS256', expiresIn: '7d' }
        ]
      ])
    })
  })
})
