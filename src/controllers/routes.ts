import { Router } from '@well-known-components/http-server'
import { GlobalContext } from '../types'
import { obtainChallengeHandler, verifyChallengeHandler } from './handlers/challenge-handler'
import { publicKeyHandler } from './handlers/public-key-handler'

export async function setupRouter(): Promise<Router<GlobalContext>> {
  const router = new Router<GlobalContext>()

  //  Used by NGINX to obtain the public key used in the validation of each JWT
  router.get('/public_key', publicKeyHandler)

  // Creates a cryptographic challenge for the client
  router.get('/challenge', obtainChallengeHandler)

  // If challenge is valid, returns JWT as cookie
  router.post('/challenge', verifyChallengeHandler)

  return router
}
