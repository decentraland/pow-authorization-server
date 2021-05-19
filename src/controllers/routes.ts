import { Router } from '@well-known-components/http-server'
import { GlobalContext } from '../types'
import { obtainChallengeHandler, verifyChallengeHandler } from './handlers/challenge-handler'
import { publicKeyHandler } from './handlers/public-key-handler'

// We return the entire router because it will be easier to test than a whole server
export async function setupRouter(globalContext: GlobalContext): Promise<Router<GlobalContext>> {
  const router = new Router<GlobalContext>()

  //  Used by NGINX to validate each JWT
  // GET /public_key
  // OK 200 { publicKey: string }
  router.get('/public_key', publicKeyHandler)

  // Creates a cryptographic challenge for the client
  // GET /challenge
  // OK 200 { difficulty: 2, hash: string }
  router.get('/challenge', obtainChallengeHandler)

  // If challenge is valid, returns JWT as cookie
  // POST /challenge_response { nonce: number, difficulty: 2, hash: string  }
  // OK 200 (response sets a cookie)
  router.post('/challenge', verifyChallengeHandler(globalContext.components))

  return router
}
