import { render } from '@testing-library/react-native';
import { setMediaState } from '@tamagui/web';
import { TamaguiProvider } from 'tamagui';

import itemArtworkFilterLarge from '@/assets/images/inventory/grid-filter-large.webp';
import itemArtworkFilterSmall from '@/assets/images/inventory/grid-filter-small.webp';
import { tamaguiConfig } from '../../../tamagui.config';
import { ItemArtwork } from './item-artwork';

jest.mock('expo-image', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');

  return {
    Image: (props: { source: unknown; testID?: string; [key: string]: unknown }) => {
      const { source, testID, ...rest } = props;
      const viewProps: Record<string, unknown> = { ...rest, src: source, testID };
      return <View {...viewProps} />;
    },
  };
});

async function renderArtwork(large: boolean, source: string | number) {
  setMediaState({ large });
  return await render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <ItemArtwork
        accessibilityLabel="Test item"
        recyclingKey="test-item"
        source={source}
        testID="test-item-artwork"
      />
    </TamaguiProvider>,
  );
}

describe('ItemArtwork', () => {
  afterEach(() => {
    setMediaState({ large: false });
  });
  it.each([
    { large: false, size: 48, filter: itemArtworkFilterSmall },
    { large: true, size: 104, filter: itemArtworkFilterLarge },
  ])('renders the responsive artwork geometry and filter', async ({ filter, large, size }) => {
    const view = await renderArtwork(large, 'https://example.test/item.webp');

    expect(view.getByTestId('test-item-artwork')).toHaveStyle({
      borderBottomLeftRadius: 999,
      borderBottomRightRadius: 999,
      borderTopLeftRadius: 999,
      borderTopRightRadius: 999,
      height: size,
      overflow: 'hidden',
      width: size,
    });

    const image = view.getByTestId('test-item-artwork-image');
    expect(image.props.src).toBe('https://example.test/item.webp');
    expect(image.props.recyclingKey).toBe('test-item');
    expect(image.props.cachePolicy).toBe('memory-disk');
    expect(image.props.contentFit).toBe('contain');
    expect(image.props.accessibilityLabel).toBe('Test item');

    const artworkFilter = view.getByTestId('test-item-artwork-filter', {
      includeHiddenElements: true,
    });
    expect(artworkFilter.props.src).toBe(filter);
    expect(artworkFilter.props.cachePolicy).toBe('memory');
    expect(artworkFilter.props.contentFit).toBe('fill');
    expect(artworkFilter.props['aria-hidden']).toBe(true);
  });

  it('passes local asset module sources through the same image path', async () => {
    const view = await renderArtwork(false, 42);

    expect(view.getByTestId('test-item-artwork-image').props.src).toBe(42);
  });
});
