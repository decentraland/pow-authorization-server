import {
  createServerComponent,
  createStatusCheckComponent,
  IHttpServerOptions
} from '@well-known-components/http-server'
import { createLogComponent } from '@well-known-components/logger'
import { createMetricsComponent } from '@well-known-components/metrics'
import { createAndInitializeConfigComponent, parseRangesVariables } from './logic/componentsUtils'
import { generateSigningKeys } from './logic/key-generator'
import { metricDeclarations } from './metrics'
import { createCache } from './ports/cache'
import { writeToFile } from './ports/local_storage'
import { AppComponents, COMPLEXITY_RANGES_VARIABLE, GlobalContext, SECRETS_DIRECTORY_VARIABLE } from './types'

// Initialize all the components of the app
export async function initComponents(): Promise<AppComponents> {
  const config = await createAndInitializeConfigComponent()
  const logs = createLogComponent()
  const options: Partial<IHttpServerOptions> = {
    cors: {
      origin: true,
      methods: 'GET,HEAD,POST,PUT,DELETE,CONNECT,TRACE,PATCH',
      credentials: true
    }
  }
  const server = await createServerComponent<GlobalContext>({ config, logs }, options)
  const statusChecks = await createStatusCheckComponent({ server })
  const metrics = await createMetricsComponent(metricDeclarations, { server, config })
  const keys = generateSigningKeys()
  const complexityRanges = parseRangesVariables((await config.getString(COMPLEXITY_RANGES_VARIABLE)) as string)

  const unsolvedCache = createCache()
  const solvedCache = createCache()

  const dir: string = (await config.getString(SECRETS_DIRECTORY_VARIABLE)) as string
  writeToFile(dir, 'public_key.pem', keys.publicKey)

  return {
    config,
    logs,
    server,
    statusChecks,
    metrics,
    keys,
    unsolvedCache,
    solvedCache,
    complexityRanges
  }
}
