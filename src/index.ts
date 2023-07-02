import sjcl from 'sjcl'

const defaults = { v: 1, iter: 10000, ks: 128, ts: 64, mode: "ccm", adata: "", cipher: "aes" }
const characters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', '/', '*', '~', '!', '@', '#', '$', '%', '^', '&']

const randomNumber = (min: number = 0, max: number = Number.MAX_SAFE_INTEGER) => min + Math.floor(Math.random() * (max - min + 1))
const randomElement = (array: any[]) => array[randomNumber(0, array.length - 1)]
const textToChars = (text: string) => text.split('').map(c => c.charCodeAt(0))
const byteHex = (n: number) => ("0" + Number(n).toString(16)).slice(-2)
const stringFromCode = (code: number) => String.fromCharCode(code)

function genSalt(length: number) {
    let salt = randomElement(characters)
    for (let i = 1; i < length; i++) salt += randomElement(characters)
    return salt
}

function encode(data: string, secret: string) {
    const applySecret = (code: any) => textToChars(secret).reduce((a, b) => a ^ b, code)
    return data.toString().split('').map(textToChars).map(applySecret).map(byteHex).join('')
}

function decode(token: any, secret: string) {
    const applySecret = (code: any) => textToChars(secret).reduce((a, b) => a ^ b, code)
    return token.match(/.{1,2}/g).map((hex: string) => parseInt(hex, 16)).map(applySecret).map(stringFromCode).join('')
}

function sign(data: any, secret: string, { expiresIn = 0, sl = 8 }: { expiresIn: number, sl: number } = { expiresIn: 0, sl: 8 }): string {
    const salt = genSalt(sl)
    const token = encode(JSON.stringify({ data, iat: Date.now(), exp: expiresIn }), secret + salt)
    const signature = encode(salt, secret)
    return `${token}.${signature}`
}

function verify(token: string, secret: string) {
    try {
        const [dataStr, signature] = token.split('.')
        const salt = decode(signature, secret)
        const { data, iat, exp } = JSON.parse(decode(dataStr, secret + salt))
        if (!exp || Date.now() < iat + exp) return data
        throw new Error()
    } catch { throw new Error('Invalid token or secret!') }
}

function encrypt(data: any, secret: string, { expiresIn = 0 }: { expiresIn: number } = { expiresIn: 0 }): string {
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