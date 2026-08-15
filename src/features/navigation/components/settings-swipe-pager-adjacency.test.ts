import { settingsNavigation } from '../navigation-config';
import { resolveSettingsSwipeAction } from './settings-swipe-pager';

const settingsItems = Object.values(settingsNavigation.pages)
  .sort((left, right) => left.sort - right.sort)
  .map(({ id }) => ({ id }));

describe('settings swipe page adjacency', () => {
  it('does not treat exiting from the first page as a previous page', () => {
    expect(resolveSettingsSwipeAction({
      activeId: 'network',
      direction: 'right',
      items: settingsItems,
    })?.type === 'select-page').toBe(false);
  });

  it('reports adjacent pages in either direction', () => {
    expect(resolveSettingsSwipeAction({
      activeId: 'account',
      direction: 'right',
      items: settingsItems,
    })?.type === 'select-page').toBe(true);
    expect(resolveSettingsSwipeAction({
      activeId: 'account',
      direction: 'left',
      items: settingsItems,
    })?.type === 'select-page').toBe(true);
  });
});
