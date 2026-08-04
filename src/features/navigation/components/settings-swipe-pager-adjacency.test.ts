import { settingsNavigation } from '../navigation-config';
import { hasAdjacentSettingsPage } from './settings-swipe-pager';

const settingsItems = Object.values(settingsNavigation.pages)
  .sort((left, right) => left.sort - right.sort)
  .map(({ id }) => ({ id }));

describe('hasAdjacentSettingsPage', () => {
  it('does not treat exiting from the first page as a previous page', () => {
    expect(hasAdjacentSettingsPage({
      activeId: 'network',
      direction: 'right',
      items: settingsItems,
    })).toBe(false);
  });

  it('reports adjacent pages in either direction', () => {
    expect(hasAdjacentSettingsPage({
      activeId: 'account',
      direction: 'right',
      items: settingsItems,
    })).toBe(true);
    expect(hasAdjacentSettingsPage({
      activeId: 'account',
      direction: 'left',
      items: settingsItems,
    })).toBe(true);
  });
});
