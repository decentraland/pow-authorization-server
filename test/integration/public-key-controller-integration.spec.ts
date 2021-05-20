import { Lifecycle } from '@well-known-components/interfaces'
import { Response } from 'node-fetch'
import { AppComponents, BaseComponents } from '../../src/types'
import { fetchLocalHost, startApp } from './server-utils'

describe('GET /public_key', () => {
  let program: Lifecycle.ComponentBasedProgram<BaseComponents | AppComponents>
  beforeAll(async () => {
    program = await startApp()
  })

  afterAll(async () => {
    await program.stop()
  })

  afterAll(async () => {})

  it('responds success status', async () => {
    const response: Response = await fetchLocalHost('/public_key')

    expect(response.status).toEqual(200)
  })

  it('responds the public key', async () => {
    const response: Response = await fetchLocalHost('/public_key')
    const responseBody = await response.json()

    expect(responseBody).toEqual(expect.objectContaining({ publicKey: expect.any(String) }))
  })
})
