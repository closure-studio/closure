import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import type { Ref } from 'react';

type MockFlashListProps<TItem> = {
  data: readonly TItem[] | null;
  renderItem: (info: { item: TItem; index: number; extraData: unknown }) => React.ReactElement | null;
  keyExtractor: (item: TItem, index: number) => string;
  extraData?: unknown;
  testID?: string;
  onLayout?: (event: LayoutChangeEvent) => void;
  showsVerticalScrollIndicator?: boolean;
  style?: StyleProp<ViewStyle>;
};

jest.mock('@shopify/flash-list', () => {
  const react = require('react') as typeof import('react');
  const reactNative = require('react-native') as typeof import('react-native');

  const MockFlashList = react.forwardRef(function MockFlashList<TItem>(
    props: MockFlashListProps<TItem>,
    _ref: Ref<unknown>,
  ) {
    const {
      data,
      extraData,
      keyExtractor,
      onLayout,
      renderItem,
      showsVerticalScrollIndicator,
      style,
      testID,
    } = props;
    return react.createElement(
      reactNative.ScrollView,
      { testID, onLayout, showsVerticalScrollIndicator, style },
      (data ?? []).map((item, index) => react.createElement(
        reactNative.View,
        { key: keyExtractor(item, index) },
        renderItem({ item, index, extraData }),
      )),
    );
  });

  const useMappingHelper = () => ({
    getMappingKey: (itemKey: string | number | bigint, index: number) => index,
  });

  return { FlashList: MockFlashList, useMappingHelper };
});
