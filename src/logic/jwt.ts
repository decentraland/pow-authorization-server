import * as jwt from 'jsonwebtoken'
import { SolvedChallenge } from './challenge'

export function signJWT(toValidate: SolvedChallenge, privateKey: string, passphrase: string): string {
  return jwt.sign(
    {
      nonce: toValidate.nonce,
      challenge: toValidate.challenge,
      complexity: toValidate.complexity
    },
    {
      key: privateKey.toString(),
      passphrase: passphrase
    },
    { algorithm: 'RS256', expiresIn: '7d' }
  )
}
