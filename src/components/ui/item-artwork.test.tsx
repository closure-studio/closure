import { render } from '@testing-library/react-native';
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

async function renderArtwork(layoutSize: 'small' | 'large', source: string | number) {
  return await render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <ItemArtwork
        accessibilityLabel="Test item"
        layoutSize={layoutSize}
        recyclingKey="test-item"
        source={source}
        testID="test-item-artwork"
      />
    </TamaguiProvider>,
  );
}

describe('ItemArtwork', () => {
  it.each([
    { layoutSize: 'small' as const, size: 48, filter: itemArtworkFilterSmall },
    { layoutSize: 'large' as const, size: 104, filter: itemArtworkFilterLarge },
  ])('renders the $layoutSize artwork geometry and filter', async ({ filter, layoutSize, size }) => {
    const view = await renderArtwork(layoutSize, 'https://example.test/item.webp');

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
    const view = await renderArtwork('small', 42);

    expect(view.getByTestId('test-item-artwork-image').props.src).toBe(42);
  });
});
