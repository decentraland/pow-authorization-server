import { createServerComponent, createStatusCheckComponent } from '@well-known-components/http-server'
import { createLogComponent } from '@well-known-components/logger'
import { createMetricsComponent } from '@well-known-components/metrics'
import { createAndInitializeConfigComponent } from './logic/componentsUtils'
import { generateSigningKeys } from './logic/key-generator'
import { metricDeclarations } from './metrics'
import { createAndInitializeCache } from './ports/cache'
import { writeToFile } from './ports/local_storage'
import { AppComponents, GlobalContext, SECRETS_DIRECTORY_VARIABLE } from './types'

// Initialize all the components of the app
export async function initComponents(): Promise<AppComponents> {
  const config = await createAndInitializeConfigComponent()
  const logs = createLogComponent()
  const server = await createServerComponent<GlobalContext>({ config, logs }, {})
  const statusChecks = await createStatusCheckComponent({ server })
  const metrics = await createMetricsComponent(metricDeclarations, { server, config })
  const keys = generateSigningKeys()

  const cache = await createAndInitializeCache(config)

  const dir: string = (await config.getString(SECRETS_DIRECTORY_VARIABLE)) as string
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
