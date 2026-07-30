import { render, waitFor } from '@testing-library/react-native';

import { i18n } from '@/i18n';
import { LocalizationProvider } from './localization-provider';

jest.mock('@/i18n/locale', () => ({
  ...jest.requireActual<typeof import('@/i18n/locale')>('@/i18n/locale'),
  resolveLocale: () => 'en',
}));

describe('LocalizationProvider', () => {
  it('reports language change failures without leaking the rejection', async () => {
    await i18n.changeLanguage('zh-CN');
    const languageChangeError = new Error('language change failed');
    const changeLanguageSpy = jest.spyOn(i18n, 'changeLanguage').mockRejectedValueOnce(languageChangeError);
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const screen = await render(
      <LocalizationProvider>
        <></>
      </LocalizationProvider>,
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Unable to change application language.',
        languageChangeError,
      );
    });

    await screen.unmount();
    changeLanguageSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});
