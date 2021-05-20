import { Lifecycle } from '@well-known-components/interfaces'
import * as jwt from 'jsonwebtoken'
import { Response } from 'node-fetch'
import { SolvedChallenge } from '../../src/logic/challenge'
import { AppComponents, BaseComponents } from '../../src/types'
import { fetchLocalHost, postLocalHost, startApp } from './server-utils'

describe('GET /challenge', () => {
  let program: Lifecycle.ComponentBasedProgram<BaseComponents | AppComponents>
  beforeAll(async () => {
    program = await startApp()
  })

  afterAll(async () => {
    await program.stop()
  })

  it('responds success status', async () => {
    const response: Response = await fetchLocalHost('/challenge')

    expect(response.status).toEqual(200)
  })

  it('responds the complexity and challenge string', async () => {
    const response: Response = await fetchLocalHost('/challenge')
    const responseBody = await response.json()

    expect(responseBody).toEqual(expect.objectContaining({ challenge: expect.any(String), complexity: 4 }))
  })
})

describe('POST /challenge', () => {
  let program: Lifecycle.ComponentBasedProgram<BaseComponents | AppComponents>

  const validChallenge: SolvedChallenge = {
    complexity: 3,
    challenge: '0844051b66184853ace759705c93ac27c9401ad7',
    nonce:
      'a1b9e4a0c1bb539ce6f99fccbc9a5ceceb3cab646d94fba7aa1c6d48bfd550421a2b2b47141517883a74c4377cb3f5b68730820d99356d0e41eb84d4612a7e49e5c1be999a294118ba55ec4e28fc6947883c9dc1240f2704e90626d53dfeb391e58942f2b6858451dd57a3cd2f71308f1e370901707f78a126c42a009901a092aa8f02ebce034c4a0359a8140f35427058ed7a1e1d6a9001855e09ea83bb343cf2e20d686297d32f0677e6c048973091e814f8d892f31bf43dd0552dab1dd46368dc304c02de094aeaec02c783ddd9b9878a706c7930b22db137443dfccfc02c7a5f2ea266632361f481628a17e6a4f0e5d2ddd50f3ee7fd3e1331adf365dd32'
  }

  beforeAll(async () => {
    program = await startApp()
  })

  afterAll(async () => {
    await program.stop()
  })

  it('when posting no body then responds 500 status', async () => {
    const response: Response = await postLocalHost('/challenge')

    expect(response.status).toEqual(500)
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
    const publicKey: string = (await (await fetchLocalHost('/public_key')).json()).publicKey
    const response: Response = await postLocalHost('/challenge', validChallenge)
    const returnedJWT = (await response.json()).jwt

    expect(returnedJWT).not.toBeUndefined()
    const decodedJWT = jwt.verify(returnedJWT, publicKey)

    expect(decodedJWT).toEqual(
      expect.objectContaining({ ...validChallenge, exp: expect.any(Number), iat: expect.any(Number) })
      // TODO:: Validate something about exp and iat
    )
  })

  it('when posting a valid solved challenge then returns the JWT in the header as cookie', async () => {
    const response: Response = await postLocalHost('/challenge', validChallenge)

    // TODO: Do this as an object
    expect(response.headers.has('set-cookie')).toEqual(true)
    expect(response.headers.get('set-cookie')).toEqual(expect.any(String))
    // TODO: Verify something about the cookie value
  })
})
