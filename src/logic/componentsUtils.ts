import { createDotEnvConfigComponent } from '@well-known-components/env-config-provider'
import { IConfigComponent } from '@well-known-components/interfaces'
import { COMPLEXITY_RANGES_VARIABLE, SECRETS_DIRECTORY_VARIABLE } from '../types'

export async function createAndInitializeConfigComponent(): Promise<IConfigComponent> {
  return createDotEnvConfigComponent(
    {},
    {
      [COMPLEXITY_RANGES_VARIABLE]: '0:4,600:5,1200:6,2000:7',
      [SECRETS_DIRECTORY_VARIABLE]: 'etc/secrets'
    }
  )
}

export function parseRangesVariables(complexityRangesVariable: string): Record<number, number> {
  const complexitiesMap: Record<number, number> = complexityRangesVariable.split(',').reduce((dict, currentRange) => {
    const [bound, complexity] = currentRange.split(':').map((x) => parseInt(x))
    return {
      ...dict,
      [bound]: complexity
    }
  }, {})

  if (complexitiesMap[0] == null) {
    throw new Error('The ranges should include 0')
  }

  return complexitiesMap
}
