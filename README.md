# jssign

A better, faster, lighter and more secure alternative to [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)

## Features

- Encrypt data using a secret
- Decrypt a token with secret to retrive data back

## Installation

To install jssign

```bash
  # with npm:
  npm install jssign --save

  # with yarn:
  yarn add jssign

  # with pnpm:
  pnpm add jssign

  # with bun:
  bun add jssign
```

## Usage

`jssign` exports different functions for data encryption for different use cases:

### Faster Usage

For a faster (but less secure) encoding and decoding of data using a secret, `jssign` exports the following functions:

- `sign(data, secret, options)`: returns encoded token
- `verify(token, secret)`: returns decoded data

```javascript
import { sign, verify } from "jssign";

const secret = "top-secret";
const token = sign({ foo: "bar" }, secret, { sl: 16 }); // no expiration
const data = verify(token, secret);

console.log(data); // { foo: 'bar' }
```

`data` can be an object literal, buffer or string representing valid JSON.

`secret` can be a string

`options`:

- `expiresIn` can be a numeric value representing time in ms (default value is `0` which represents no expiration).
- `sl` can be a numberic value representing salt length (default value is `32`). Salt is a random string which is added on top of data to keep the token different everytime even for the same data.

### More secure Usage

For a more secure (but slower) encryption and decryption of data using a secret, `jssign` exports the following functions that uses [sjcl](https://www.npmjs.com/package/sjcl) under the hood:

- `encrypt(data, secret, options, sjclOptions)`: return encrypted token
- `decrypt(token, secret)`: returns decrypted data

```javascript
import { encrypt, decrypt } from "jssign";

const secret = "top-secret";
const token = encrypt({ id: "confidential_data" }, secret, { expiresIn: 180000 }); // will expire after 30 minutes of token creation
const data = decrypt(token, secret);

console.log(data); // { id: 'confidential_data' }
```

`data` can be an object literal, buffer or string representing valid JSON.

`secret` can be a string

`options`:

- `expiresIn` can be a numeric value representing time in ms (default value is `0` which represents no expiration).

`sjclOptions` are the options taken by `sjcl.encrypt` method having type `SjclCipherEncryptParams`

## Author

[Sahil Aggarwal](https://www.github.com/SahilAggarwal2004)
