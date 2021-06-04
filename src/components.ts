import { createDotEnvConfigComponent } from '@well-known-components/env-config-provider'
import { createServerComponent, createStatusCheckComponent } from '@well-known-components/http-server'
import { createLogComponent } from '@well-known-components/logger'
import { createMetricsComponent } from '@well-known-components/metrics'
import { generateSigningKeys } from './logic/key-generator'
import { metricDeclarations } from './metrics'
import { createCache } from './ports/cache'
import { writeToFile } from './ports/local_storage'
import { AppComponents, GlobalContext } from './types'

// Initialize all the components of the app
export async function initComponents(): Promise<AppComponents> {
  const config = await createDotEnvConfigComponent({})
  const logs = createLogComponent()
  const server = await createServerComponent<GlobalContext>({ config, logs }, {})
  const statusChecks = await createStatusCheckComponent({ server })
  const metrics = await createMetricsComponent(metricDeclarations, { server, config })
  const keys = generateSigningKeys()
  const cache = createCache()

  const dir = (await config.getString('SECRETS_DIRECTORY')) || 'etc/secrets'
  writeToFile(dir, 'public_key.pem', keys.publicKey)

  return {
    config,
    logs,
    server,
    statusChecks,
    metrics,
    keys,
    cache
  }
}
