export interface SignOptions {
    expiresIn?: number;
    sl?: number;
}
export interface EncryptOptions {
    expiresIn?: number;
}
declare function sign(data: any, secret: string, { expiresIn, sl }?: SignOptions): string;
declare function verify(token: string, secret: string): any;
declare function encrypt(data: any, secret: string, { expiresIn }?: EncryptOptions): string;
declare function decrypt(token: string, secret: string): any;
export { sign, verify, encrypt, decrypt };
