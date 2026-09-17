import { act, render } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { toast } from '@tamagui/toast/v2';
import { TamaguiProvider, getTokens } from 'tamagui';

import { i18n } from '@/i18n';
import { tamaguiConfig } from '../../../tamagui.config';
import { AppToastHost } from './app-toast-host';

let mockLarge = false;

jest.mock('react-native-reanimated', () => {
  const actual = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated');
  const mock = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated/mock');
  return { ...actual, ...mock, useReducedMotion: () => true };
});

jest.mock('tamagui', () => ({
  ...jest.requireActual<typeof import('tamagui')>('tamagui'),
  useMedia: () => ({ large: mockLarge }),
}));

const safeAreaMetrics = {
  frame: { height: 844, width: 390, x: 0, y: 0 },
  insets: { bottom: 34, left: 0, right: 0, top: 47 },
};

function toastHostTree(insets = safeAreaMetrics.insets) {
  return (
    <TamaguiProvider
      config={tamaguiConfig}
      defaultTheme="dark"
      insets={insets}
    >
      <I18nextProvider i18n={i18n}>
        <AppToastHost />
      </I18nextProvider>
    </TamaguiProvider>
  );
}

async function renderToastHost(insets = safeAreaMetrics.insets) {
  await i18n.changeLanguage('en');
  const screen = await render(toastHostTree(insets));
  await act(async () => {
    await Promise.resolve();
  });
  return screen;
}

describe('AppToastHost', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockLarge = false;
  });

  afterEach(async () => {
    await act(async () => {
      toast.dismiss();
      jest.runOnlyPendingTimers();
      await Promise.resolve();
    });
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('keeps the native portal z-index within the signed 32-bit range', async () => {
    const screen = await renderToastHost();

    await act(async () => {
      toast.info('Visible native portal');
      await Promise.resolve();
    });

    const unsafePortals = screen.container.queryAll((instance) => {
      const style: unknown = instance.props.style;
      return typeof style === 'object'
        && style !== null
        && 'zIndex' in style
        && typeof style.zIndex === 'number'
        && style.zIndex > 0x7fff_ffff;
    });
    expect(unsafePortals).toHaveLength(0);
  });

  it.each([
    ['adds product spacing after the safe area', safeAreaMetrics.insets],
    ['uses product spacing when the safe-area top is zero', { ...safeAreaMetrics.insets, top: 0 }],
  ])('%s', async (_name, insets) => {
    const screen = await renderToastHost(insets);
    const edgeOffset = getTokens().space[3].val;

    await act(async () => {
      toast.info('Positioned notification');
      await Promise.resolve();
    });

    expect(screen.getByTestId('app-toast-viewport')).toHaveStyle({
      top: insets.top,
      marginTop: edgeOffset,
    });
  });

  it.each([
    ['info', (title: string) => toast.info(title)],
    ['success', (title: string) => toast.success(title)],
    ['warning', (title: string) => toast.warning(title)],
    ['error', (title: string) => toast.error(title)],
  ])('renders the %s presentation', async (type, showToast) => {
    const screen = await renderToastHost();

    await act(async () => {
      showToast(`${type} message`);
      await Promise.resolve();
    });

    expect(screen.getByText(`${type} message`)).toBeTruthy();
    expect(screen.getAllByTestId(`app-toast-${type}`).length).toBeGreaterThan(0);
  });

  it.each([
    ['default', (title: string) => toast(title)],
    ['loading', (title: string) => toast.loading(title)],
  ])('falls back to the info presentation for a %s toast', async (_type, showToast) => {
    const screen = await renderToastHost();

    await act(async () => {
      showToast('Fallback message');
      await Promise.resolve();
    });

    expect(screen.getByText('Fallback message')).toBeTruthy();
    expect(screen.getAllByTestId('app-toast-info').length).toBeGreaterThan(0);
  });

  it('shows long descriptions without line clamping', async () => {
    const screen = await renderToastHost();
    const description = 'Long toast description '.repeat(30).trim();

    await act(async () => {
      toast.info('Detailed status', { description });
      await Promise.resolve();
    });

    expect(screen.getByText(description).props.numberOfLines).toBeUndefined();
  });

  it('keeps the message readable without controls and dismisses after its timeout', async () => {
    const screen = await renderToastHost();
    let toastId: string | number | undefined;

    await act(async () => {
      toastId = toast.success('Saved');
      await Promise.resolve();
    });
    expect(screen.getByText('Saved')).toBeTruthy();
    expect(screen.queryByTestId('app-toast-close')).toBeNull();
    expect(screen.getAllByTestId('app-toast-scan', { includeHiddenElements: true })[0]).toHaveStyle({ opacity: 0 });

    await act(async () => {
      jest.advanceTimersByTime(5_000);
      await Promise.resolve();
    });

    expect(toast.getToasts().some(({ id }) => id === toastId)).toBe(false);
  });
});
