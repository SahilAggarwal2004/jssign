import { characters } from "../constants.js";

export const byteHex = (n: number): string => ("0" + Number(n).toString(16)).slice(-2);

const randomNumber = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

export const randomElement = <T>(array: readonly T[]): T => array[randomNumber(0, array.length - 1)];

export function genSalt(length: number) {
  let salt = randomElement(characters);
  for (let i = 1; i < length; i++) salt += randomElement(characters);
  return salt;
}

export const stringFromCode = (code: number): string => String.fromCharCode(code);

export const textToChars = (text: string): number[] => text.split("").map((c) => c.charCodeAt(0));
