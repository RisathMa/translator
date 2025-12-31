
export enum TranslationTab {
  TEXT = 'text',
  VOICE = 'voice',
  CAMERA = 'camera',
  ARCHITECTURE = 'architecture'
}

export interface LanguageMap {
  name: string;
  code: string;
  floresCode: string;
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  detectedLanguage?: string;
  latency?: number;
}
