import { defaultLocale, resolveLocale } from './locale';

describe('resolveLocale', () => {
  it('selects the first supported language preference', () => {
    expect(resolveLocale([
      { languageCode: 'fr', languageTag: 'fr-FR' },
      { languageCode: 'en', languageTag: 'en-AU' },
    ])).toBe('en');
  });

  it('normalizes Chinese locale variants', () => {
    expect(resolveLocale([{ languageCode: null, languageTag: 'zh-Hant-TW' }])).toBe('zh-CN');
  });

  it('falls back when no preference is supported', () => {
    expect(resolveLocale([{ languageCode: 'fr', languageTag: 'fr-FR' }])).toBe(defaultLocale);
  });
});
