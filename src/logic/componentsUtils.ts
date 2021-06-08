import { createDotEnvConfigComponent } from '@well-known-components/env-config-provider'
import { IConfigComponent } from '@well-known-components/interfaces'
import {
  DEFAULT_MAX_COMPLEXITY_VARIABLE,
  DEFAULT_MIN_COMPLEXITY_VARIABLE,
  DEFAULT_MIN_USERS_VARIABLE,
  SECRETS_DIRECTORY_VARIABLE
} from '../types'

export async function createAndInitializeConfigComponent(): Promise<IConfigComponent> {
  return createDotEnvConfigComponent(
    {},
    {
      [DEFAULT_MIN_USERS_VARIABLE]: '350',
      [DEFAULT_MIN_COMPLEXITY_VARIABLE]: '4',
      [DEFAULT_MAX_COMPLEXITY_VARIABLE]: '10',
      [SECRETS_DIRECTORY_VARIABLE]: 'etc/secrets'
    }
  )
}
