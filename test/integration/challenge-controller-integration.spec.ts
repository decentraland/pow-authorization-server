import { Lifecycle } from '@well-known-components/interfaces'
import { parse as parseCookie } from 'cookie'
import { verify as verifyJWT } from 'jsonwebtoken'
import { Response } from 'node-fetch'
import { SolvedChallenge } from '../../src/logic/challenge'
import { AppComponents, BaseComponents } from '../../src/types'
import { inNext7Days, verifyDateIsCloseTo } from './utils/date-time-utils'
import { fetchLocalHost, postLocalHost, startApp } from './utils/server-utils'

describe('GET /challenge', () => {
  let program: Lifecycle.ComponentBasedProgram<BaseComponents | AppComponents>
  let getChallengeResponse: Response

  beforeAll(async () => {
    program = await startApp()

    getChallengeResponse = await fetchLocalHost('/challenge')
  })

  afterAll(async () => {
    await program.stop()
  })

  it('responds with a success status', () => {
    expect(getChallengeResponse.status).toEqual(200)
  })

  it('responds the complexity and challenge', async () => {
    const responseBody = await getChallengeResponse.json()

    expect(responseBody).toEqual(expect.objectContaining({ challenge: expect.any(String), complexity: 4 }))
  })
})

describe('POST /challenge', () => {
  let program: Lifecycle.ComponentBasedProgram<BaseComponents | AppComponents>
  let publicKey: string
  const validChallenge: SolvedChallenge = {
    complexity: 3,
    challenge: '0844051b66184853ace759705c93ac27c9401ad7',
    nonce:
      'a1b9e4a0c1bb539ce6f99fccbc9a5ceceb3cab646d94fba7aa1c6d48bfd550421a2b2b47141517883a74c4377cb3f5b68730820d99356d0e41eb84d4612a7e49e5c1be999a294118ba55ec4e28fc6947883c9dc1240f2704e90626d53dfeb391e58942f2b6858451dd57a3cd2f71308f1e370901707f78a126c42a009901a092aa8f02ebce034c4a0359a8140f35427058ed7a1e1d6a9001855e09ea83bb343cf2e20d686297d32f0677e6c048973091e814f8d892f31bf43dd0552dab1dd46368dc304c02de094aeaec02c783ddd9b9878a706c7930b22db137443dfccfc02c7a5f2ea266632361f481628a17e6a4f0e5d2ddd50f3ee7fd3e1331adf365dd32'
  }

  beforeAll(async () => {
    program = await startApp()
    publicKey = await obtainPublicKey()
  })

  afterAll(async () => {
    await program.stop()
  })

  describe('without body', () => {
    let postChallengeResponse: Response
    beforeAll(async () => {
      postChallengeResponse = await postLocalHost('/challenge')
    })

    it('should respond with bad request status', () => {
      expect(postChallengeResponse.status).toEqual(400)
    })
  })

  describe('with invalid challenge', () => {
    let postInvalidChallengeResponse: Response

    beforeAll(async () => {
      postInvalidChallengeResponse = await postLocalHost('/challenge', {
        complexity: 4,
        challenge: 'aChallenge'
      })
    })

    it('should respond with bad request status', () => {
      expect(postInvalidChallengeResponse.status).toEqual(400)
    })
  })

  describe('with wrong solved challenge', () => {
    let postWrongSolvedChallengeResponse: Response

    beforeAll(async () => {
      postWrongSolvedChallengeResponse = await postLocalHost('/challenge', {
        complexity: 4,
        challenge: 'aChallenge',
        nonce: 'aNonce'
      })
    })

    it('should respond with bad request status', () => {
      expect(postWrongSolvedChallengeResponse.status).toEqual(401)
    })
  })

  describe('with valid challenge', () => {
    let postValidChallengeResponse: Response
    let beforeCallTime: number
    let beforeCallTimestamp: number
    let afterCallTimestamp: number

    beforeAll(async () => {
      beforeCallTime = Date.now()
      beforeCallTimestamp = Math.floor(Date.now() / 1000)
      postValidChallengeResponse = await postLocalHost('/challenge', validChallenge)
      afterCallTimestamp = Math.ceil(Date.now() / 1000)
    })

    describe('contains JWT in body', () => {
      let returnedJWTInBody: string

      beforeAll(async () => {
        returnedJWTInBody = (await postValidChallengeResponse.json()).jwt
      })

      it('responds success status', async () => {
        expect(postValidChallengeResponse.status).toEqual(200)
      })

      it('returns the JWT in the body', async () => {
        compareJWT(returnedJWTInBody, publicKey, validChallenge, beforeCallTimestamp, afterCallTimestamp)
      })

      describe('contains cookie header', () => {
        let cookieValues: { [x: string]: string; JWT?: any; Expires?: any }

        beforeAll(async () => {
          expect(postValidChallengeResponse.headers.has('set-cookie')).toEqual(true)
          cookieValues = parseCookie(postValidChallengeResponse.headers.get('set-cookie') || '')
        })

        it('contains jwt and expires', async () => {
          expect(cookieValues).toEqual(
            expect.objectContaining({ JWT: expect.any(String), Expires: expect.any(String) })
          )
        })

        it('returns the same JWT in the cookie header as in body', async () => {
          const returnedJWTInCookie = cookieValues.JWT

          expect(returnedJWTInCookie).toEqual(returnedJWTInBody)
        })

        it('contains valid expiration date in the cookie header', async () => {
          const expirationDate = new Date(cookieValues.Expires).getTime()

          verifyDateIsCloseTo(expirationDate, beforeCallTime, inNext7Days(Date.now()))
        })
      })
    })
  })
})

function compareJWT(
  jwtString: string,
  publicKey: string,
  validChallenge: SolvedChallenge,
  beforeCallTimestamp: number,
  afterCallTimestamp: number
) {
  expect(jwtString).not.toBeUndefined()
  const decodedJWT = verifyJWT(jwtString, publicKey)
  expect(decodedJWT).toEqual(
    expect.objectContaining({ ...validChallenge, exp: expect.any(Number), iat: expect.any(Number) })
  )

  const dateInSevenDaysInSeconds = Math.ceil(inNext7Days(Date.now()) / 1000)

  verifyDateIsCloseTo((decodedJWT as any).exp, beforeCallTimestamp, dateInSevenDaysInSeconds)
  verifyDateIsCloseTo((decodedJWT as any).iat, beforeCallTimestamp, afterCallTimestamp)
}

async function obtainPublicKey(): Promise<string> {
  return (await (await fetchLocalHost('/public_key')).json()).publicKey
}
