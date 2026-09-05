export interface Language {
  code: string;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
}

export const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', dir: 'ltr' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', dir: 'ltr' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', dir: 'ltr' },
];

export const defaultLanguage = 'en';

export function getLanguage(code: string): Language | undefined {
  return languages.find(l => l.code === code);
}
