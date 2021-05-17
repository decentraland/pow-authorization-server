import { createConfigComponent } from '@well-known-components/env-config-provider'
import { createServerComponent, IFetchComponent } from '@well-known-components/http-server'
import { createLogComponent } from '@well-known-components/logger'
import { createMetricsComponent } from '@well-known-components/metrics'
import { createRunner } from '@well-known-components/test-helpers'
import nodeFetch from 'node-fetch'
import { metricDeclarations } from '../../src/metrics'
import { main } from '../../src/service'
import { GlobalContext, TestComponents } from '../../src/types'

const currentPort = 19000

// creates a "mocha-like" describe function to run tests using the test components
export const test = createRunner({
  main,
  initComponents
})

async function initComponents(): Promise<TestComponents> {
  const logs = createLogComponent()

  const config = createConfigComponent({
    HTTP_SERVER_PORT: (currentPort + 1).toString(),
    HTTP_SERVER_HOST: '0.0.0.0'
  })

  const protocolHostAndProtocol = `http://${await config.requireString(
    'HTTP_SERVER_HOST'
  )}:${await config.requireNumber('HTTP_SERVER_PORT')}`

  const server = await createServerComponent<GlobalContext>({ logs, config }, {})

  const fetch: IFetchComponent = {
    async fetch(url, initRequest?) {
      if (typeof url == 'string' && url.startsWith('/')) {
        return nodeFetch(protocolHostAndProtocol + url, { ...initRequest })
      } else {
        return nodeFetch(url, initRequest)
      }
    }
  }

  const metrics = await createMetricsComponent(metricDeclarations, { server, config })

  return { logs, config, server, fetch, metrics }
}
