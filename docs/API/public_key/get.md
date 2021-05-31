# Get Public Key

Used by NGINX to obtain the public key used in the validation of each JWT

**URL** : `/public_key`

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
  "publicKey":
    "-----BEGIN PUBLIC KEY-----\nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEArAvF256Zphq64j6uE1dO\nQnxgpjHHG5diOoXh81qfPQRYXd4LACPKVG+a8HCQ1sE7SRVxwePwCpShgwi+EMaM\nozlNJ5+VBGdIjzt1FjdDpEIc97JQ2Nb9SB1jVURDqvGVWvctB9lahorTg06JWrDI\nHXKYTjXFlcw6aKWvis74HuGfPVQcRUGLgZN1Ho22Lcqyb13hLGXHvWvVpDO/agxm\n8oe4K/kBV9gT6abwjlfcYXNZl0nsxx/9dV1jn4EriX7OAOcdbZd1ImlmwCyW4Kig\nw4fry/2UrsvMbkME34iK9+RpGEmnMY0Hce2sQa/cm9D7LR8lm6za8prcNwkqU4fw\na/1LfoMV1Vi2KRrn3H6EfgMZLUNWinDlmd7vn8/2EEfmnU6MXzN6JU3sOycoljnl\nmp28QvKH60pHN/WJNanuxHpJXjCoXddA35nASYyzebRDIrb2xqLZC/ymc19RlWDT\njm04y+ZcTraZsZ6odcYDdyFWT19MBqEt5FF18ZuoadI+52FI35Sdhdj8uJtu+NzA\nn/rnsM01gmUJ7pheY3z7oHJTix33G+EcTogl+GWN41j9+VC9zklnm03A7XMxTbTN\nKEZdhisJ6yPvq+Slt5VaKSziKAlnIsSAZe4zlr2pQ150dQYwNdhmhWNYYzUEwxUR\nj0r/+oSoufQFNqRSu0YMYyECAwEAAQ==\n-----END PUBLIC KEY-----\n"
}
```
