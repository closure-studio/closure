import { render } from '@testing-library/react-native';
import { TamaguiProvider } from 'tamagui';

import { TerminalMarquee } from '@/components';
import { tamaguiConfig } from '../tamagui.config';

async function renderTerminalMarquee(items: React.ComponentProps<typeof TerminalMarquee>['items']) {
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <TerminalMarquee items={items} />
    </TamaguiProvider>,
  );
}

describe('TerminalMarquee', () => {
  it('renders two visual loop segments but exposes each message once to accessibility queries', async () => {
    const screen = await renderTerminalMarquee([
      { id: 'warning', label: 'Maintenance soon', tone: 'warning' },
      { id: 'status', label: 'Network stable', tone: 'accent' },
    ]);

    expect(screen.getByText('Maintenance soon')).toBeTruthy();
    expect(screen.getByText('Network stable')).toBeTruthy();
    expect(screen.getAllByText('Maintenance soon', { includeHiddenElements: true })).toHaveLength(2);
    expect(screen.getAllByText('Network stable', { includeHiddenElements: true })).toHaveLength(2);
  });

  it('does not render an empty marquee frame', async () => {
    const screen = await renderTerminalMarquee([]);

    expect(screen.toJSON()).toBeNull();
  });
});
