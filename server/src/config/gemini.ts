import { GoogleGenAI } from '@google/genai';
import { getEnv } from './env.js';

let _genai: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI {
  if (!_genai) {
    _genai = new GoogleGenAI({ apiKey: getEnv().GOOGLE_API_KEY });
  }
  return _genai;
}

export const MODELS = {
  REASONING: 'gemini-3.1-pro-preview',
  IMAGE: 'gemini-3.1-flash-image-preview',
  FAST: 'gemini-2.5-flash',
} as const;
