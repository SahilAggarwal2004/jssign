declare function sign(data: any, secret: string, { expiresIn, sl }?: {
    expiresIn: number;
    sl: number;
}): string;
declare function verify(token: string, secret: string): any;
declare function encrypt(data: any, secret: string, { expiresIn }?: {
    expiresIn: number;
}): string;
declare function decrypt(token: string, secret: string): any;
export { sign, verify, encrypt, decrypt };
