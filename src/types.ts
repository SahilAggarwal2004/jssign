import type { SjclCipherEncryptParams } from "sjcl";

// lib/cipher.ts
export type CipherMode = 0 | 1;

// index.ts
export type EncryptOptions = { expiresIn?: number };

export type SignOptions = EncryptOptions & { sl?: number };

export type SjclOptions = SjclCipherEncryptParams;
