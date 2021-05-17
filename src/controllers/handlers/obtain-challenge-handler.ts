import { AppComponents, Context } from '../../types'

// handlers arguments only type what they need, to make unit testing easier
export type ObtainChallengeComponents = Pick<AppComponents, 'metrics'>

export async function obtainChallengeHandler(context: { url: URL; components: ObtainChallengeComponents }) {
  const {
    url,
    components: { metrics }
  } = context

  metrics.increment('obtain_challenge_counter', {
    pathname: url.pathname
  })

  return {
    body: { complexity: 2, challenge: 'hash' }
  }
}
