# Send Challenge

Validates the challenge. If it's correct, then it returns the JWT including the solution (in the body and as cookie header).
If not, responds with 400 or 401 depending on the error type.

**URL** : `/challenge`

**Method** : `POST`

**Auth required** : YES

**Permissions required** : None

**Data constraints**

```json
{
    "challenge": "string",
    "complexity": "number",
    "nonce": "string
}
```

```
hash(challenge + nonce).repeat('0'.times(complexity))

```

**Data example** All fields must be sent.

Provide the solved challenge.

```json
{
  "challenge": "0844051b66184853ace759705c93ac27c9401ad7",
  "complexity": 3,
  "nonce": "a1b9e4a0c1bb539ce6f99fccbc9a5ceceb3cab646d94fba7aa1c6d48bfd550421a2b2b47141517883a74c4377cb3f5b68730820d99356d0e41eb84d4612a7e49e5c1be999a294118ba55ec4e28fc6947883c9dc1240f2704e90626d53dfeb391e58942f2b6858451dd57a3cd2f71308f1e370901707f78a126c42a009901a092aa8f02ebce034c4a0359a8140f35427058ed7a1e1d6a9001855e09ea83bb343cf2e20d686297d32f0677e6c048973091e814f8d892f31bf43dd0552dab1dd46368dc304c02de094aeaec02c783ddd9b9878a706c7930b22db137443dfccfc02c7a5f2ea266632361f481628a17e6a4f0e5d2ddd50f3ee7fd3e1331adf365dd32"
}
```

## Success Response

**Condition** : If the challenge is correctly solved

**Code** : `201 Created`

**Content example**

```json
{
  "jwt": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImExYjllNGEwYzFiYjUzOWNlNmY5OWZjY2JjOWE1Y2VjZWIzY2FiNjQ2ZDk0ZmJhN2FhMWM2ZDQ4YmZkNTUwNDIxYTJiMmI0NzE0MTUxNzg4M2E3NGM0Mzc3Y2IzZjViNjg3MzA4MjBkOTkzNTZkMGU0MWViODRkNDYxMmE3ZTQ5ZTVjMWJlOTk5YTI5NDExOGJhNTVlYzRlMjhmYzY5NDc4ODNjOWRjMTI0MGYyNzA0ZTkwNjI2ZDUzZGZlYjM5MWU1ODk0MmYyYjY4NTg0NTFkZDU3YTNjZDJmNzEzMDhmMWUzNzA5MDE3MDdmNzhhMTI2YzQyYTAwOTkwMWEwOTJhYThmMDJlYmNlMDM0YzRhMDM1OWE4MTQwZjM1NDI3MDU4ZWQ3YTFlMWQ2YTkwMDE4NTVlMDllYTgzYmIzNDNjZjJlMjBkNjg2Mjk3ZDMyZjA2NzdlNmMwNDg5NzMwOTFlODE0ZjhkODkyZjMxYmY0M2RkMDU1MmRhYjFkZDQ2MzY4ZGMzMDRjMDJkZTA5NGFlYWVjMDJjNzgzZGRkOWI5ODc4YTcwNmM3OTMwYjIyZGIxMzc0NDNkZmNjZmMwMmM3YTVmMmVhMjY2NjMyMzYxZjQ4MTYyOGExN2U2YTRmMGU1ZDJkZGQ1MGYzZWU3ZmQzZTEzMzFhZGYzNjVkZDMyIiwiY2hhbGxlbmdlIjoiMDg0NDA1MWI2NjE4NDg1M2FjZTc1OTcwNWM5M2FjMjdjOTQwMWFkNyIsImNvbXBsZXhpdHkiOjMsImlhdCI6MTYyMjQ3MjUzMCwiZXhwIjoxNjIzMDc3MzMwfQ.be6-3sQ2TxB0Fl4LmXcc1iuHq-uhI-b22wWqjxs01tPcsMaC1ccQMnE_juj5TK3FC72TxUNwhHPRQmDwfI-gRbcTWyVEyZ0QYX6e3V5wCipKIxAAsKY7PG3Pbbc9-j_zvJcP3jASO9PQ0vB1KZI7u2tMuHt2hG6KR8gCS9CFDuJ3Ukmi2BMba5DkS-A2thaESASRI3fiYhqCWoNcKJ6FGTO7Dv0zRnspCWLAQgbuOCrIiWdTCr9eS-ivBPVWOWxKrCaZyNxsoEwrgtSqJySJNzAjBSwAQ6wpuu6amOQI0H5EUKX-LptH26ilvDRUcpqfrD_-c9f5dDuspOv1xEpiF6bdgDSRua9fYQqNcw7zMNshYmDZ-zV73VOt974oR328Hebh14O_ONJpyGcwahSoUGJUj5F6LjXbwDy4XkFPEkDfGDcCRltPAvlcnkMHcMTO4nICysTl2e5HM5BZvxD2aeZR9wvqVdHXW4AazUhnATgvqsj_Tu9qJMUN1P9hhJzJJBciLjlkG-n30LMF5rcj9lSiHZ6JoUn0b3MHaNy-ZBmiA106-oscM0UKvdE6_bw5POIVrJQ9dmlz_slwXfe0xXBkDXNjO5-5dpWb5T3kxFG4BTo61uuXvPmHNt6tM59E7JYNS1URdxme_Y_xO0EdyHTqrfkm9MRcfXYgf6FmykU"
}
```

**Headers** :

```
Set-Cookie:
  JWT=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImExYjllNGEwYzFiYjUzOWNlNmY5OWZjY2JjOWE1Y2VjZWIzY2FiNjQ2ZDk0ZmJhN2FhMWM2ZDQ4YmZkNTUwNDIxYTJiMmI0NzE0MTUxNzg4M2E3NGM0Mzc3Y2IzZjViNjg3MzA4MjBkOTkzNTZkMGU0MWViODRkNDYxMmE3ZTQ5ZTVjMWJlOTk5YTI5NDExOGJhNTVlYzRlMjhmYzY5NDc4ODNjOWRjMTI0MGYyNzA0ZTkwNjI2ZDUzZGZlYjM5MWU1ODk0MmYyYjY4NTg0NTFkZDU3YTNjZDJmNzEzMDhmMWUzNzA5MDE3MDdmNzhhMTI2YzQyYTAwOTkwMWEwOTJhYThmMDJlYmNlMDM0YzRhMDM1OWE4MTQwZjM1NDI3MDU4ZWQ3YTFlMWQ2YTkwMDE4NTVlMDllYTgzYmIzNDNjZjJlMjBkNjg2Mjk3ZDMyZjA2NzdlNmMwNDg5NzMwOTFlODE0ZjhkODkyZjMxYmY0M2RkMDU1MmRhYjFkZDQ2MzY4ZGMzMDRjMDJkZTA5NGFlYWVjMDJjNzgzZGRkOWI5ODc4YTcwNmM3OTMwYjIyZGIxMzc0NDNkZmNjZmMwMmM3YTVmMmVhMjY2NjMyMzYxZjQ4MTYyOGExN2U2YTRmMGU1ZDJkZGQ1MGYzZWU3ZmQzZTEzMzFhZGYzNjVkZDMyIiwiY2hhbGxlbmdlIjoiMDg0NDA1MWI2NjE4NDg1M2FjZTc1OTcwNWM5M2FjMjdjOTQwMWFkNyIsImNvbXBsZXhpdHkiOjMsImlhdCI6MTYyMjQ3MjUzMCwiZXhwIjoxNjIzMDc3MzMwfQ.be6-3sQ2TxB0Fl4LmXcc1iuHq-uhI-b22wWqjxs01tPcsMaC1ccQMnE_juj5TK3FC72TxUNwhHPRQmDwfI-gRbcTWyVEyZ0QYX6e3V5wCipKIxAAsKY7PG3Pbbc9-j_zvJcP3jASO9PQ0vB1KZI7u2tMuHt2hG6KR8gCS9CFDuJ3Ukmi2BMba5DkS-A2thaESASRI3fiYhqCWoNcKJ6FGTO7Dv0zRnspCWLAQgbuOCrIiWdTCr9eS-ivBPVWOWxKrCaZyNxsoEwrgtSqJySJNzAjBSwAQ6wpuu6amOQI0H5EUKX-LptH26ilvDRUcpqfrD_-c9f5dDuspOv1xEpiF6bdgDSRua9fYQqNcw7zMNshYmDZ-zV73VOt974oR328Hebh14O_ONJpyGcwahSoUGJUj5F6LjXbwDy4XkFPEkDfGDcCRltPAvlcnkMHcMTO4nICysTl2e5HM5BZvxD2aeZR9wvqVdHXW4AazUhnATgvqsj_Tu9qJMUN1P9hhJzJJBciLjlkG-n30LMF5rcj9lSiHZ6JoUn0b3MHaNy-ZBmiA106-oscM0UKvdE6_bw5POIVrJQ9dmlz_slwXfe0xXBkDXNjO5-5dpWb5T3kxFG4BTo61uuXvPmHNt6tM59E7JYNS1URdxme_Y_xO0EdyHTqrfkm9MRcfXYgf6FmykU;
  Expires=Mon, 07 Jun 2021 14:48:50 GMT
```

## Error Responses

**Condition** : If the request body is incomplete

**Code** : `400 Client Error`

**Content** : `Invalid Request, body must be present with challenge, nonce and complexity`

### Or

**Condition** : If the challenge is expired or was never sent

**Code** : `400 Client Error`

**Content** : `Invalid Challenge`

### Or

**Condition** : If the complexity solved is not the right complexity

**Code** : `400 Client Error`

**Content** : `The complexity does not match the expected one`

### Or

**Condition** : If the challenge is not correctly solved

**Code** : `401 Unauthorized`

**Content** `Invalid Challenge`
