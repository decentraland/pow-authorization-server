import { createDotEnvConfigComponent } from '@well-known-components/env-config-provider'
import { IConfigComponent } from '@well-known-components/interfaces'
import {
  COMPLEXITY_RANGES_VARIABLE,
  DEFAULT_MAX_COMPLEXITY_VARIABLE,
  DEFAULT_MIN_COMPLEXITY_VARIABLE,
  SECRETS_DIRECTORY_VARIABLE
} from '../types'

export async function createAndInitializeConfigComponent(): Promise<IConfigComponent> {
  return createDotEnvConfigComponent(
    {},
    {
      [DEFAULT_MAX_COMPLEXITY_VARIABLE]: '7',
      [DEFAULT_MIN_COMPLEXITY_VARIABLE]: '4',
      [COMPLEXITY_RANGES_VARIABLE]: '200:4,600:5,1200:6,2000:7',
      [SECRETS_DIRECTORY_VARIABLE]: 'etc/secrets'
    }
  )
}

export function parseRangesVariables(complexityRangesVariable: string): Record<number, number> {
  return complexityRangesVariable.split(',').reduce((dict, currentRange) => {
    const [bound, complexity] = currentRange.split(':')
    return {
      ...dict,
      [bound]: complexity
    }
  }, {})
}
