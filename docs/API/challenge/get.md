# Get Challenge

Creates a cryptographic challenge for the client

The challenge will only be valid to solve for half an hour, after that it will become invalid to solve (unless the same challenge is issued again)

**URL** : `/challenge`

**Method** : `GET`

**Auth required** : NO

**Permissions required** : None

**Data constraints** : `{}`

## Success Responses

**Condition** : -

**Code** : `200 OK`

**Content** :

```json
{
  "complexity": 4,
  "challenge": "0ecff46ed6725c630606256e9db45badd37c3e52868884d4d50c147c3bd79165b2072e2f4b27f889c9c9933eb354cce2a2d66f0b1cd0842740bbd1b70e87b831ae8396cddc889b2efff3304b6c63b3447b50e694e3ef26fdf62d9a72bdaffd9715eb6758060ed485cc8562a66bc3070e305244af3f33a466d3875b33910f5842ffac61a2315ff3b278adb1aec3a251b0429265d1bac18d70b078276a7386124d6587310284f7b254c978c445798a09d3e27f6a819a297bfd0f0703828cc1c6e2616752f2c394a46050091ffb94c79390cc415f89403eb26589becc17d5e4e35bc8a41a6c692160ae0a839bdd753ea64471a771ef7033e8f346a353cc19db5c6f"
}
```
