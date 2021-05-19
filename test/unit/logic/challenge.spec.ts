import * as crypto from 'crypto'
import { Challenge, isValidChallenge, SolvedChallenge } from '../../../src/logic/challenge'

describe.only('challenge tests', () => {
  it('simple test', async () => {
    const challenge = crypto.randomBytes(20).toString('hex')

    console.log(`challenge ${challenge}`)

    const complexity = 3

    const solved = await resolveChallenge({ challenge, complexity })

    expect(await isValidChallenge(solved, { challenge, complexity })).toBe(true)
  })

  async function resolveChallenge(challenge: Challenge): Promise<SolvedChallenge> {
    while (true) {
      const nonce = crypto.randomBytes(256).toString('hex')
      const isValid = await isValidChallenge({ ...challenge, nonce }, challenge)
      if (isValid) {
        return { ...challenge, nonce }
      }
    }
  }
})
