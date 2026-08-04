import { render } from '@testing-library/react-native';
import { createRef } from 'react';
import type { View } from 'react-native';
import { TamaguiProvider } from 'tamagui';

import { HorizontalSwipeProvider } from '@/components';
import { tamaguiConfig } from '../../../tamagui.config';
import {
  SettingsPagerTabs,
  resolveSettingsSwipeAction,
} from './components/settings-swipe-pager';
import { settingsNavigation } from './navigation-config';

const settingsItems = Object.values(settingsNavigation.pages)
  .sort((left, right) => left.sort - right.sort)
  .map(({ id }) => ({ id, label: id }));

async function renderSettingsPagerTabs() {
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <HorizontalSwipeProvider>
        <SettingsPagerTabs
          activeId="network"
          blurTarget={createRef<View>()}
          items={settingsItems}
          onSelect={jest.fn()}
          swipeHint="SWIPE L/R"
          tabListLabel="Settings tabs"
        />
      </HorizontalSwipeProvider>
    </TamaguiProvider>,
  );
}

describe('SettingsPagerTabs', () => {
  it('shows the swipe instruction without using it as the tablist name', async () => {
    const screen = await renderSettingsPagerTabs();
    const tabList = screen.getByLabelText('Settings tabs');

    expect(screen.getByText('SWIPE L/R')).toBeTruthy();
    expect(tabList.props['aria-label']).toBe('Settings tabs');
    expect(tabList.props['aria-label']).not.toBe('SWIPE L/R');
    expect(screen.getByRole('tab', { name: 'network' }).props['aria-selected']).toBe(true);
  });
});

describe('resolveSettingsSwipeAction', () => {
  it('moves forward for a left swipe at the threshold', () => {
    expect(resolveSettingsSwipeAction({
      activeId: 'network',
      direction: 'left',
      items: settingsItems,
    })).toEqual({ pageId: 'account', type: 'select-page' });
  });

  it('moves backward for a right swipe', () => {
    expect(resolveSettingsSwipeAction({
      activeId: 'acknowledgements',
      direction: 'right',
      items: settingsItems,
    })).toEqual({ pageId: 'account', type: 'select-page' });
  });

  it('exits settings for a right swipe from the first page', () => {
    expect(resolveSettingsSwipeAction({
      activeId: 'network',
      direction: 'right',
      items: settingsItems,
    })).toEqual({ type: 'exit' });
  });

  it.each([
    { activeId: 'acknowledgements', direction: 'left' },
  ] as const)('does not navigate past the final page', (gesture) => {
    expect(resolveSettingsSwipeAction({ ...gesture, items: settingsItems })).toBeNull();
  });
});
