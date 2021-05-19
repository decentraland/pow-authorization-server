import * as jwt from 'jsonwebtoken'
import { SolvedChallenge } from './challenge'

export function signJWT(toValidate: SolvedChallenge, privateKey: string): string {
  return jwt.sign(
    {
      nonce: toValidate.nonce,
      challenge: toValidate.challenge,
      complexity: toValidate.complexity
    },
    privateKey,
    { algorithm: 'RS256', expiresIn: '7d' }
  )
}
