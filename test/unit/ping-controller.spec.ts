import { createTestMetricsComponent } from '@well-known-components/metrics'
import expect from 'expect'
import { publicKeyHandler } from '../../src/controllers/handlers/public-key-handler'
import { metricDeclarations } from '../../src/metrics'

describe('ping-controller-unit', () => {
  it('must return the pathname of a URL', async () => {
    const url = new URL('https://github.com/public_key')
    const metrics = createTestMetricsComponent(metricDeclarations)
    expect((await metrics.getValue('public_key_counter')).values).toEqual([])
    expect(await publicKeyHandler({ url, components: { metrics } })).toEqual({ body: url.pathname })
    expect((await metrics.getValue('public_key_counter')).values).toEqual([
      { labels: { pathname: '/public_key' }, value: 1 }
    ])
  })

  it('metrics should create a brand new registry', async () => {
    const url = new URL('https://github.com/public_key')
    const metrics = createTestMetricsComponent(metricDeclarations)
    expect((await metrics.getValue('public_key_counter')).values).toEqual([])
    expect(await publicKeyHandler({ url, components: { metrics } })).toEqual({ body: url.pathname })
    expect((await metrics.getValue('public_key_counter')).values).toEqual([
      { labels: { pathname: '/public_key' }, value: 1 }
    ])
  })

  it('calling twice should increment twice the metrics', async () => {
    const url = new URL('https://github.com/public_key')
    const metrics = createTestMetricsComponent(metricDeclarations)
    expect((await metrics.getValue('public_key_counter')).values).toEqual([])
    expect(await publicKeyHandler({ url, components: { metrics } })).toEqual({ body: url.pathname })
    expect(await publicKeyHandler({ url, components: { metrics } })).toEqual({ body: url.pathname })
    expect((await metrics.getValue('public_key_counter')).values).toEqual([
      { labels: { pathname: '/public_key' }, value: 2 }
    ])
  })
})
