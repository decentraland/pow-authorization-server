import { IMetricsComponent } from '@well-known-components/interfaces'
import { validateMetricsDeclaration } from '@well-known-components/metrics'

export const metricDeclarations = {
  total_request: {
    help: 'Request count',
    type: IMetricsComponent.CounterType,
    labelNames: ['pathname', 'method']
  }
}

// type assertions
validateMetricsDeclaration(metricDeclarations)
