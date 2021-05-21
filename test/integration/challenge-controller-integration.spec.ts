import { Lifecycle } from '@well-known-components/interfaces'
import * as cookie from 'cookie'
import * as jwt from 'jsonwebtoken'
import { Response } from 'node-fetch'
import { SolvedChallenge } from '../../src/logic/challenge'
import { AppComponents, BaseComponents } from '../../src/types'
import { inNext7Days, timeFromString } from './utils/date-time-utils'
import { fetchLocalHost, postLocalHost, startApp } from './utils/server-utils'

describe('GET /challenge', () => {
  let program: Lifecycle.ComponentBasedProgram<BaseComponents | AppComponents>
  let response: Response

  beforeAll(async () => {
    program = await startApp()

    response = await fetchLocalHost('/challenge')
  })

  afterAll(async () => {
    await program.stop()
  })

  it('responds with a success status', () => {
    expect(response.status).toEqual(200)
  })

  it('responds the complexity and challenge string', async () => {
    const responseBody = await response.json()

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

  describe('when posting without body', () => {
    let response: Response
    beforeAll(async () => {
      response = await postLocalHost('/challenge')
    })

    it('should respond with 400 status', () => {
      expect(response.status).toEqual(400)
    })
  })

  it('when posting invalid solved challenge then responds 401 status', async () => {
    const response: Response = await postLocalHost('/challenge', {
      complexity: 4,
      challenge: 'aChallenge',
      nonce: 'aNonce'
    })

    expect(response.status).toEqual(401)
  })

  it('when posting a valid solved challenge then responds 200 status', async () => {
    const response: Response = await postLocalHost('/challenge', validChallenge)

    expect(response.status).toEqual(200)
  })

  it('when posting a valid solved challenge then returns the JWT in the body', async () => {
    const beforeCallTimestamp = Math.floor(Date.now() / 1000)

    const response: Response = await postLocalHost('/challenge', validChallenge)
    const afterCallTimestamp = Math.ceil(Date.now() / 1000)
    const returnedJWT = (await response.json()).jwt

    validateJWT(returnedJWT, publicKey, validChallenge, beforeCallTimestamp, afterCallTimestamp)
  })

  it('when posting a valid solved challenge then returns the JWT in the header as cookie', async () => {
    const beforeCallTime = Date.now()
    const beforeCallTimestamp = Math.floor(beforeCallTime / 1000)

    const response: Response = await postLocalHost('/challenge', validChallenge)
    const afterCallTimestamp = Math.ceil(Date.now() / 1000)

    expect(response.headers.has('set-cookie')).toEqual(true)
    const cookieValues = cookie.parse(response.headers.get('set-cookie') || '')
    expect(cookieValues).toEqual(expect.objectContaining({ JWT: expect.any(String), Expires: expect.any(String) }))

    const returnedJWT = cookieValues.JWT
    const expirationDate = timeFromString(cookieValues.Expires)

    validateJWT(returnedJWT, publicKey, validChallenge, beforeCallTimestamp, afterCallTimestamp)

    expect(expirationDate).toBeGreaterThan(beforeCallTime)
    expect(expirationDate).toBeLessThan(inNext7Days(Date.now()))
  })

  // TODO!: 1) Refactor tests to be only one describe with one beforeAll and multiple its
  // TODO!: 2) Add test that validates that the cookie is the same than the one returned in the body
})

function validateJWT(
  jwtString: string,
  publicKey: string,
  validChallenge: SolvedChallenge,
  beforeCallTimestamp: number,
  afterCallTimestamp: number
) {
  expect(jwtString).not.toBeUndefined()
  const decodedJWT = jwt.verify(jwtString, publicKey)
  expect(decodedJWT).toEqual(
    expect.objectContaining({ ...validChallenge, exp: expect.any(Number), iat: expect.any(Number) })
  )

  const dateInSevenDaysInSeconds = Math.ceil(inNext7Days(Date.now()) / 1000)

  verifyDateIsCloseTo((decodedJWT as any).exp, beforeCallTimestamp, dateInSevenDaysInSeconds)
  verifyDateIsCloseTo((decodedJWT as any).iat, beforeCallTimestamp, afterCallTimestamp)
}

function verifyDateIsCloseTo(firstDate: number, closeBeforeDate: number, closeAfterDate: number) {
  expect(firstDate).toBeGreaterThanOrEqual(closeBeforeDate)
  expect(firstDate).toBeLessThanOrEqual(closeAfterDate)
}

async function obtainPublicKey(): Promise<string> {
  return (await (await fetchLocalHost('/public_key')).json()).publicKey
}
