import * as crypto from 'crypto'

export interface SigningKeys {
  privateKey: string
  publicKey: string
  passphrase: string
}

export function generateSigningKeys(): SigningKeys {
  const passphrase: string = crypto.randomBytes(256).toString('hex')
  const keyPair = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
      cipher: 'aes-256-cbc-hmac-sha256',
      passphrase: passphrase
    }
  })

  return { ...keyPair, passphrase }
}
