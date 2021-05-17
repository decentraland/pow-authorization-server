import { IMetricsComponent } from '@well-known-components/interfaces'
import { validateMetricsDeclaration } from '@well-known-components/metrics'

export const metricDeclarations = {
  obtain_challenge_counter: {
    help: 'Count calls to obtain challenge',
    type: IMetricsComponent.CounterType,
    labelNames: ['pathname']
  },
  verify_challenge_counter: {
    help: 'Count calls to verify challenge',
    type: IMetricsComponent.CounterType,
    labelNames: ['pathname']
  },
  public_key_counter: {
    help: 'Count calls to get public key',
    type: IMetricsComponent.CounterType,
    labelNames: ['pathname']
  }
}

// type assertions
validateMetricsDeclaration(metricDeclarations)
