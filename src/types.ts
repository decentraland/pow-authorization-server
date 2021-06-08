import type {
  IBaseComponent,
  IConfigComponent,
  IHttpServerComponent,
  ILoggerComponent,
  IMetricsComponent
} from '@well-known-components/interfaces'
import { SigningKeys } from './logic/key-generator'
import { metricDeclarations } from './metrics'
import { InMemoryCache } from './ports/cache'

export interface CacheRecordContent {
  complexity: number
}

export interface GlobalContext {
  components: AppComponents
}

// components used in every environment
export interface BaseComponents {
  config: IConfigComponent
  logs: ILoggerComponent
  server: IHttpServerComponent<GlobalContext>
  metrics: IMetricsComponent<keyof typeof metricDeclarations>
  keys: SigningKeys
}

// components used in runtime
export interface AppComponents extends BaseComponents {
  statusChecks: IBaseComponent
  cache: InMemoryCache<CacheRecordContent | number>
  complexityRanges: Record<number, number>
}

export const SECRETS_DIRECTORY_VARIABLE = 'SECRETS_DIRECTORY'
export const COMPLEXITY_RANGES_VARIABLE = 'COMPLEXITY_RANGES'
export const DEFAULT_MAX_COMPLEXITY_VARIABLE = 'DEFAULT_MAX_COMPLEXITY'
export const DEFAULT_MIN_COMPLEXITY_VARIABLE = 'DEFAULT_MIN_COMPLEXITY'
