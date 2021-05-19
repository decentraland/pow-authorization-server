import { publicKeyHandler } from '../../../src/controllers/handlers/public-key-handler'
import { generateSigningKeys, SigningKeys } from '../../../src/logic/key-generator'

describe('public-key-controller-unit', () => {
  let keys: SigningKeys

  beforeEach(() => {
    keys = generateSigningKeys()
  })

  it('must return the public key', async () => {
    const publicKeyBody = { publicKey: keys.publicKey }

    const response = await publicKeyHandler({ components: { keys } })

    expect(response.body).toEqual(publicKeyBody)
    expect(response.status).toEqual(200)
  })
})
