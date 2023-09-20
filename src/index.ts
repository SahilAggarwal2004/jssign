import sjcl from 'sjcl'

export type Type = 0 | 1
export interface SignOptions {
    expiresIn?: number
    sl?: number
}
export interface EncryptOptions {
    expiresIn?: number
}

const defaults = { v: 1, iter: 10000, ks: 128, ts: 64, mode: "ccm", adata: "", cipher: "aes" }
const characters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', '[', ']', ';', ',', '.', '/', '~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '{', '}', ':', '<', '>', '?']

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const randomNumber = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1))
const randomElement = (array: any[]) => array[randomNumber(0, array.length - 1)]
const textToChars = (text: string) => text.split('').map(c => c.charCodeAt(0))
const byteHex = (n: number) => ("0" + Number(n).toString(16)).slice(-2)
const stringFromCode = (code: number) => String.fromCharCode(code)

function genSalt(length: number) {
    let salt = randomElement(characters)
    for (let i = 1; i < length; i++) salt += randomElement(characters)
    return salt
}

function encode(data: string, secret: string, type: Type): string {
    if (type === 0) {
        const applySecret = (code: any) => textToChars(secret).reduce((a, b) => a ^ b, code)
        return data.toString().split('').map(textToChars).map(applySecret).map(byteHex).join('')
    }
    const dataBytes = encoder.encode(data);
    const secretBytes = encoder.encode(secret);
    const dataLength = dataBytes.length
    const secretLength = secretBytes.length
    const tokenBytes = new Uint8Array(dataLength);
    for (let i = 0; i < dataLength; i++) tokenBytes[i] = dataBytes[i] ^ secretBytes[i % secretLength];
    return Array.from(tokenBytes).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function decode(token: string, secret: string, type: Type): string {
    if (type === 0) {
        const applySecret = (code: any) => textToChars(secret).reduce((a, b) => a ^ b, code)
        return token.match(/.{1,2}/g)!.map((hex: string) => parseInt(hex, 16)).map(applySecret).map(stringFromCode).join('')
    }
    const tokenBytes = new Uint8Array(token.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const secretBytes = encoder.encode(secret);
    const tokenLength = tokenBytes.length
    const secretLength = secretBytes.length
    const decodedBytes = new Uint8Array(tokenLength);
    for (let i = 0; i < tokenLength; i++) decodedBytes[i] = tokenBytes[i] ^ secretBytes[i % secretLength];
    return decoder.decode(decodedBytes);
}


function sign(data: any, secret: string, { expiresIn = 0, sl = 32 }: SignOptions = {}): string {
    const salt = genSalt(sl)
    const token = encode(JSON.stringify({ data, iat: Date.now(), exp: expiresIn }), salt, 1)
    const signature = encode(salt, secret, 0)
    return `${token}.${signature}`
}

function verify(token: string, secret: string) {
    try {
        const [dataStr, signature] = token.split('.')
        const salt = decode(signature, secret, 0)
        const { data, iat, exp } = JSON.parse(decode(dataStr, salt, 1))
        if (!exp || Date.now() < iat + exp) return data
        throw new Error()
    } catch { throw new Error('Invalid token or secret!') }
}

function encrypt(data: any, secret: string, { expiresIn = 0 }: EncryptOptions = {}): string {
    // @ts-ignore
    const { ct, iv, salt } = JSON.parse(sjcl.encrypt(secret, JSON.stringify({ data, iat: Date.now(), exp: expiresIn })))
    return `${ct}.${iv}.${salt}`
}

function decrypt(token: string, secret: string) {
    try {
        const [ct, iv, salt] = token.split('.')
        token = JSON.stringify({ ct, iv, salt, ...defaults })
        const { data, iat, exp } = JSON.parse(sjcl.decrypt(secret, token))
        if (!exp || Date.now() < iat + exp) return data
        throw new Error()
    } catch { throw new Error('Invalid token or secret!') }
}

export { sign, verify, encrypt, decrypt }