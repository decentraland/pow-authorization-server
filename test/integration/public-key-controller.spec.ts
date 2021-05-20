import { test } from '../harness/test-components-http-server'

test('integration sanity tests using a real server backend', function ({ components, stubComponents }) {
  it('responds /public_key success status', async () => {
    const { fetch } = components

    const r = await fetch.fetch('/public_key')

    expect(r.status).toEqual(200)
  })

  it('responds /public_key the public key', async () => {
    const { fetch } = components
    const { keys } = stubComponents

    const r = await fetch.fetch('/public_key')

    expect((r.body as any).publicKey).toEqual(keys.publicKey)
  })
})

// testMock('integration sanity tests using a mocked server backend (different components)', function ({ components }) {
//   it('responds /public_key', async () => {
//     const { fetch } = components

//     const r = await fetch.fetch('/public_key')

//     expect(r.status).toEqual(200)
//     expect(await r.text()).toEqual('/public_key')
//   })
// })
