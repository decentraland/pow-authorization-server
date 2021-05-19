import { IMetricsComponent } from '@well-known-components/interfaces'
import { createTestMetricsComponent } from '@well-known-components/metrics'
import { Registry } from 'prom-client'
import { publicKeyHandler } from '../../src/controllers/handlers/public-key-handler'
import { generateSigningKeys, SigningKeys } from '../../src/logic/key-generator'
import { metricDeclarations } from '../../src/metrics'

describe('public-key-controller-unit', () => {
  let keys: SigningKeys
  let metrics: IMetricsComponent<'total_request'> & { register: Registry }
  const url = fakeFullUrl('/public_key')

  beforeEach(() => {
    metrics = createTestMetricsComponent(metricDeclarations)
    keys = generateSigningKeys()
  })

  it('must return the public key', async () => {
    const publicKeyBody = { body: { publicKey: keys.publicKey } }

    const response = await publicKeyHandler({ url, components: { metrics, keys } })

    expect(response).toEqual(publicKeyBody)
  })

  it('metrics should create a brand new registry', async () => {
    expect((await metrics.getValue('total_request')).values).toEqual([])

    await publicKeyHandler({ url, components: { metrics, keys } })

    expect((await metrics.getValue('total_request')).values).toEqual([
      { labels: { pathname: '/public_key' }, value: 1 }
    ])
  })

  it('calling twice should increment twice the metrics', async () => {
    expect((await metrics.getValue('total_request')).values).toEqual([])

    await publicKeyHandler({ url, components: { metrics, keys } })
    await publicKeyHandler({ url, components: { metrics, keys } })

    expect((await metrics.getValue('total_request')).values).toEqual([
      { labels: { pathname: '/public_key' }, value: 2 }
    ])
  })
})

function fakeFullUrl(path: string): URL {
  return new URL(`https://app.com${path}`)
}
