import { settingsNavigation } from '../navigation-config';
import { resolveSettingsSwipeAction } from './settings-swipe-pager';

const settingsItems = Object.values(settingsNavigation.pages)
  .sort((left, right) => left.sort - right.sort)
  .map(({ id }) => ({ id, label: id }));

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
