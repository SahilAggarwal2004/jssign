import sjcl from "sjcl";

import { decode, encode } from "./lib/cipher.js";
import { validateData } from "./lib/token.js";
import { genSalt } from "./lib/utils.js";
import type { EncryptOptions, SignOptions, SjclOptions } from "./types.js";

export function sign(data: unknown, secret: string, { expiresIn = 0, sl = 32 }: SignOptions = {}): string {
  const salt = genSalt(sl);
  const token = encode(JSON.stringify({ data, iat: Date.now(), exp: expiresIn }), salt, 1);
  const signature = encode(salt, secret, 0);
  return `${token}.${signature}`;
}

export function verify(token: string, secret: string): unknown {
  return validateData(token, secret, (token: string, secret: string) => {
    const [dataStr, signature] = token.split(".");
    const salt = decode(signature, secret, 0);
    return decode(dataStr, salt, 1);
  });
}

export function encrypt(data: unknown, secret: string, { expiresIn = 0 }: EncryptOptions = {}, sjclOptions?: SjclOptions): string {
  const encryptedObj = JSON.parse(sjcl.encrypt(secret, JSON.stringify({ data, iat: Date.now(), exp: expiresIn }), sjclOptions) as unknown as string);
  const encryptedArr = Object.entries(encryptedObj).map(([key, value]) => `${key}:${value}`);
  return encryptedArr.join(".");
}

export function decrypt(token: string, secret: string): unknown {
  return validateData(token, secret, (token: string, secret: string) => {
    const encryptedArr = token.split(".");
    const encryptedObj = encryptedArr.reduce((obj: Record<string, string | number>, str) => {
      const [key, value] = str.split(":");
      obj[key] = isNaN(+value) ? value : +value;
      return obj;
    }, {});
    return sjcl.decrypt(secret, JSON.stringify(encryptedObj));
  });
}
