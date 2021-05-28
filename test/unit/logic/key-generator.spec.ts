import * as crypto from 'crypto'
import { generateSigningKeys, SigningKeys } from '../../../src/logic/key-generator'

describe('Key generator', () => {
  afterAll(() => {
    jest.resetAllMocks()
  })

  describe('generateSigningKeys', () => {
    const randomBytes = 'random string'
    const keyPair: SigningKeys = {
      privateKey: 'a private key',
      publicKey: 'a public key',
      passphrase: randomBytes
    }

    let spyGenerateKeyPairSync: jest.SpyInstance
    let spyRandomBytes: jest.SpyInstance

    beforeAll(() => {
      spyGenerateKeyPairSync = jest.spyOn(crypto, 'generateKeyPairSync')
      spyGenerateKeyPairSync.mockReturnValue(keyPair)
      spyRandomBytes = jest.spyOn(crypto, 'randomBytes')
      spyRandomBytes.mockReturnValue({ toString: () => randomBytes })
    })

    it('should return the key pair of private and public keys', async () => {
      expect(generateSigningKeys()).toEqual(keyPair)
    })

    it('should call the crypto library with the expected parameters', () => {
      expect(spyGenerateKeyPairSync.mock.calls).toEqual([
        [
          'rsa',
          {
            modulusLength: 4096,
            publicKeyEncoding: {
              type: 'spki',
              format: 'pem'
            },
            privateKeyEncoding: {
              type: 'pkcs1',
              format: 'pem',
              cipher: 'aes-256-cbc-hmac-sha256',
              passphrase: randomBytes
            }
          }
        ]
      ])
    })
  })
})
