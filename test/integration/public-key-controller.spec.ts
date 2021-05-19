import { test } from '../harness/test-components-http-server'
import { testMock } from '../harness/test-components-mock'

test('integration sanity tests using a real server backend', function ({ components, stubComponents }) {
  it('responds /public_key', async () => {
    const { fetch } = components

    const r = await fetch.fetch('/public_key')

    expect(r.status).toEqual(200)
    expect(await r.text()).toEqual('/public_key')
  })

  it('calling /public_key increments a metric', async () => {
    const { fetch } = components
    const { metrics } = stubComponents

    const r = await fetch.fetch('/public_key')

    expect(r.status).toEqual(200)
    expect(await r.text()).toEqual('/public_key')

    expect(metrics.increment.calledOnceWith('total_request', { pathname: '/public_key' })).toEqual(true)
  })

  it('random url responds 404', async () => {
    const { fetch } = components

    const r = await fetch.fetch('/public_key' + Math.random())

    expect(r.status).toEqual(404)
  })

  it("next call to /public_key should fail in 'metrics' component", async () => {
    const { fetch } = components
    const { metrics } = stubComponents

    metrics.increment.throwsException('some exception')

    const r = await fetch.fetch('/public_key')

    expect(r.status).toEqual(500)
  })
})

testMock('integration sanity tests using a mocked server backend (different components)', function ({ components }) {
  it('responds /public_key', async () => {
    const { fetch } = components

    const r = await fetch.fetch('/public_key')

    expect(r.status).toEqual(200)
    expect(await r.text()).toEqual('/public_key')
  })
})
