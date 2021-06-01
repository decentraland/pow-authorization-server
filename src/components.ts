import { createDotEnvConfigComponent } from '@well-known-components/env-config-provider'
import { createServerComponent, createStatusCheckComponent } from '@well-known-components/http-server'
import { createLogComponent } from '@well-known-components/logger'
import { createMetricsComponent } from '@well-known-components/metrics'
import * as fs from 'fs'
import { generateSigningKeys } from './logic/key-generator'
import { metricDeclarations } from './metrics'
import { createFetchComponent } from './ports/fetch'
import { AppComponents, GlobalContext } from './types'

// Initialize all the components of the app
export async function initComponents(): Promise<AppComponents> {
  console.error('QUEE')
  const config = await createDotEnvConfigComponent({})
  const logs = createLogComponent()
  const server = await createServerComponent<GlobalContext>({ config, logs }, {})
  const statusChecks = await createStatusCheckComponent({ server })
  const fetch = await createFetchComponent()
  const metrics = await createMetricsComponent(metricDeclarations, { server, config })
  const keys = generateSigningKeys()

  const dir = 'secrets'

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }

  if (fs.existsSync(`${dir}/public_key.pem`)) {
    fs.unlinkSync(`${dir}/public_key.pem`)
  }
  // Store to file the public key
  fs.writeFile(`${dir}/public_key.pem`, keys.publicKey, (err) => {
    // throws an error, you could also catch it here
    if (err) throw err
  })

  return {
    config,
    logs,
    server,
    statusChecks,
    fetch,
    metrics,
    keys
  }
}
