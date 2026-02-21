import { pairRegex } from "../constants";
import type { CipherMode } from "../types";
import { byteHex, stringFromCode, textToChars } from "./utils";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function encode(data: string, secret: string, mode: CipherMode): string {
  if (mode === 0) {
    const applySecret = (code: number) => textToChars(secret).reduce((a, b) => a ^ b, code);
    return textToChars(data.toString()).map(applySecret).map(byteHex).join("");
  }

  const dataBytes = encoder.encode(data);
  const secretBytes = encoder.encode(secret);
  const dataLength = dataBytes.length;
  const secretLength = secretBytes.length;
  const tokenBytes = new Uint8Array(dataLength);

  for (let i = 0; i < dataLength; i++) tokenBytes[i] = dataBytes[i] ^ secretBytes[i % secretLength];

  return Array.from(tokenBytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function decode(token: string, secret: string, mode: CipherMode): string {
  const hexPairs = token.match(pairRegex);
  if (!hexPairs) return "";

  if (mode === 0) {
    const applySecret = (code: number) => textToChars(secret).reduce((a, b) => a ^ b, code);
    return hexPairs
      .map((hex: string) => parseInt(hex, 16))
      .map(applySecret)
      .map(stringFromCode)
      .join("");
  }

  const tokenBytes = new Uint8Array(hexPairs.map((byte) => parseInt(byte, 16)));
  const secretBytes = encoder.encode(secret);
  const tokenLength = tokenBytes.length;
  const secretLength = secretBytes.length;
  const decodedBytes = new Uint8Array(tokenLength);

  for (let i = 0; i < tokenLength; i++) decodedBytes[i] = tokenBytes[i] ^ secretBytes[i % secretLength];

  return decoder.decode(decodedBytes);
}
