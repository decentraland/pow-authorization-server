import { Lifecycle } from '@well-known-components/interfaces'
import { setupRouter } from './controllers/routes'
import { generateSigningKeys } from './logic/key-generator'
import { AppComponents, GlobalContext, TestComponents } from './types'

// this function wires the business logic (adapters & controllers) with the components (ports)
export async function main(program: Lifecycle.EntryPointParameters<AppComponents | TestComponents>) {
  const { components, startComponents } = program
  const globalContext: GlobalContext = {
    components
  }

  components.keys = generateSigningKeys()

  // wire the HTTP router (make it automatic? TBD)
  const router = await setupRouter(globalContext)
  components.server.use(router.middleware())
  components.server.setContext(globalContext)

  // start ports: db, listeners, synchronizatons, etc
  await startComponents()
}
