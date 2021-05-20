import { Lifecycle } from '@well-known-components/interfaces'
import fetch from 'node-fetch'
import { initComponents } from '../../src/components'
import { main } from '../../src/service'

describe('integration sanity tests using a real server backend', () => {
  beforeAll(async () => {
    await Lifecycle.run({ main, initComponents })
  })

  it('responds /public_key success status', async () => {
    expect(await (await fetch('http://0.0.0.0:5000/public_key')).json()).toEqual(
      expect.objectContaining({ publicKey: expect.any(String) })
    )
  })

  // it('responds /public_key the public key', async () => {
  //   const { fetch } = components
  //   const { keys } = stubComponents

  //   const r = await fetch.fetch('/public_key')

  //   expect((r.body as any).publicKey).toEqual(keys.publicKey)
  // })
})

// testMock('integration sanity tests using a mocked server backend (different components)', function ({ components }) {
//   it('responds /public_key', async () => {
//     const { fetch } = components

//     const r = await fetch.fetch('/public_key')

//     expect(r.status).toEqual(200)
//     expect(await r.text()).toEqual('/public_key')
//   })
// })
