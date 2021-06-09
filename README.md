# Proof of Work: Authorization Server

This service exposes an API to authenticate requests using Proof of work.

Auth server creates a challenge that the client needs to solve using Proof Of Work. The challenge consists of:

- Complexity: number
- Challenge: string

So, the client needs to find a nonce (string), that the following calculation evaluates to true:

```
hash(challenge + nonce).startsWith('0'.repeat(complexity))
```

The hash used is `sha256` with `hex` text encoding. Challenge size is 256 bytes.

If the challenge is valid, then the service will return a JWT that contains the nonce which will be used as identifier. The JWT is generated using `RS256` algorithm.

The public key to validate the returned JWT can be obtained in a format of `pem` with type `spki`.

## How to integrate with this server?

1. Obtain a challenge:

```pseudo-code
response = fetch("authserverHostname/challenge")
challenge: string = response.body.challenge
complexity: number = response.body.complexity
```

2. Generate challenge:

run `node utils/solveChallenge.js <challenge> <complexity>`

3. Obtain JWT:

```pseudo-code
response = post("authserverHostname/challenge", { complexity, nonce, challenge })
jwt = response.body.jwt
jwtCookieHeader = response.headers['Set-Cookie']
```

## API Docs

[You can find all API documentation here.](docs/API/AUTH_API.md)

## Environment Variables

- `SECRETS_DIRECTORY`: Path of the folder where the file `public_key.pem` will be stored when the app starts.
- `COMPLEXITY_RANGES_VARIABLE`: This variable is used to define the ranges of complexity of the challenge sent to the users, it should always contain the 0, the default value is `0:4,600:5,1200:6,2000:7`

## Architecture

Extension of "ports and adapters architecture", also known as "hexagonal architecture".

With this architecture, code is organized into several layers: logic, controllers, adapters, and ports.

### components

We use the components abstraction to organize our ports (e.g. HTTP client, database client, redis client) and any other logic that needs to track mutable state or encode dependencies between stateful components. For every environment (e.g. test, e2e, prod, staging...) we have a different version of our component systems, enabling us to easily inject mocks or different implementations for different contexts.

We make components available to incoming http and kafka handlers. For instance, the http-server handlers have access to things like the database or HTTP components, and pass them down to the controller level for general use.
