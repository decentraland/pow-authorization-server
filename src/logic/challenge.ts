import * as crypto from 'crypto'

export interface Challenge {
  challenge: string
  complexity: number
}

export type SolvedChallenge = Challenge & {
  nonce: string
}

export async function isValidChallenge(solvedChallenge: SolvedChallenge, givenChallenge: Challenge): Promise<boolean> {
  if (
    solvedChallenge.challenge !== givenChallenge.challenge ||
    solvedChallenge.complexity !== givenChallenge.complexity
  ) {
    return false
  }
  const hash = crypto
    .createHash('sha256')
    .update(solvedChallenge.challenge + solvedChallenge.nonce, 'hex')
    .digest('hex') // hash the message

  return hash.startsWith('0'.repeat(solvedChallenge.complexity))
}

export async function generateChallenge(): Promise<Challenge> {
  return { complexity: 2, challenge: crypto.randomBytes(256).toString('hex') }
}
