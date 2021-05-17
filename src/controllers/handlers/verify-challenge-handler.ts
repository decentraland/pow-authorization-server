import { IHttpServerComponent } from '@well-known-components/interfaces'
import { AppComponents, Context } from '../../types'

// handlers arguments only type what they need, to make unit testing easier
export type VerifyChallengeComponents = Pick<AppComponents, 'metrics'>
export function verifyChallengeHandler(
  components: VerifyChallengeComponents
): IHttpServerComponent.IRequestHandler<Context<'/challenge'>> {
  return async (context) => {
    const { url } = context

    components.metrics.increment('verify_challenge_counter', {
      pathname: url.pathname
    })

    const body: BodyRequest = await context.request.clone().json()

    // validate

    const challenge = body.challenge
    const complexity = body.complexity
    const nonce = body.nonce

    const hash = await digestMessage(challenge + nonce)
    const isValid = hash.startsWith('0'.repeat(complexity))

    // set cookie

    return {
      body: url.pathname
    }
  }
}

async function digestMessage(message: string) {
  const msgUint8 = new TextEncoder().encode(message) // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8) // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)) // convert buffer to byte array
  const hashHex = hashArray.map((b) => b.toString(10).padStart(2, '0')).join('') // convert bytes to string
  return hashHex
}

interface BodyRequest {
  nonce: number
  challenge: string
  complexity: number
}
