declare function sign(data: any, secret: string, { expiresIn, sl }?: Partial<{
    expiresIn: number;
    sl: number;
}>): string;
declare function verify(token: string, secret: string): any;
declare function encrypt(data: any, secret: string, { expiresIn }?: Partial<{
    expiresIn: number;
}>): string;
declare function decrypt(token: string, secret: string): any;
export { sign, verify, encrypt, decrypt };
