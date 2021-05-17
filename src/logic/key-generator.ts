import * as crypto from 'crypto'

export interface SigningKeys {
  privateKey: string
  publicKey: string
}

export function generateSigningKeys(): SigningKeys {
  const keyPair = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'pkcs1',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
      cipher: 'aes-256-cbc-hmac-sha256',
      passphrase: crypto.randomBytes(256).toString('hex')
    }
  })

  return keyPair
}
