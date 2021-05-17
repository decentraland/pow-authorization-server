export async function digestMessage(message: string) {
  const msgUint8 = new TextEncoder().encode(message) // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8) // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)) // convert buffer to byte array
  const hashHex = hashArray.map((b) => b.toString(10).padStart(2, '0')).join('') // convert bytes to string
  return hashHex
}
export async function isValidChallenge(solvedChallenge: SolvedChallenge, givenChallenge: Challenge) {
  if (
    solvedChallenge.challenge !== givenChallenge.challenge ||
    solvedChallenge.complexity !== givenChallenge.complexity
  ) {
    return false
  }
  const hash = await digestMessage(solvedChallenge.challenge + solvedChallenge.nonce)
  return hash.startsWith('0'.repeat(solvedChallenge.complexity))
}

interface Challenge {
  challenge: string
  complexity: number
}

export type SolvedChallenge = Challenge & {
  nonce: number
}
