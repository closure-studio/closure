import { PackageOpen } from 'lucide-react-native';
import { memo, useCallback, useId, useMemo, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  Image as SvgImage,
  Mask,
  RadialGradient as SvgRadialGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { Image, XStack, YStack, getTokens, styled, useMedia } from 'tamagui';

import { AvatarFilter, MonoText, TerminalPanel, TerminalText } from '@/components';
import type { ItemTable, ItemTableItem } from '@/schemas/game-data';
import type { Inventory } from '@/schemas/game-account';
import { getItemImageUrl } from '../item-image';

type InventoryEntry = {
  item: ItemTableItem;
  itemId: string;
  quantity: number;
};

const CIRCULAR_ARTWORK_RADIUS = 999;
const DESKTOP_ITEM_ARTWORK_SCALE = 0.84;
const MOBILE_ITEM_ARTWORK_SIZE = 40;
const DESKTOP_ITEM_ARTWORK_SIZE = 100;
const MOBILE_PREVIEW_ARTWORK_SIZE = 56;
const DESKTOP_PREVIEW_ARTWORK_SIZE = 160;
const MOBILE_MIN_ITEM_WIDTH = 128;
const DESKTOP_MIN_ITEM_WIDTH = 240;
const DEFAULT_MOBILE_COLUMN_COUNT = 2;
const DEFAULT_DESKTOP_COLUMN_COUNT = 4;
const INITIAL_ROWS_TO_RENDER = 1;
const MAX_ROWS_PER_RENDER_BATCH = 1;
const VIRTUALIZED_ROW_WINDOW_SIZE = 2;
const ROW_BATCHING_PERIOD_MS = 100;
const ITEM_ARTWORK_FEATHER_STOPS = [
  { offset: '0%', opacity: 1, color: '#ffffff' },
  { offset: '58%', opacity: 1, color: '#ffffff' },
  { offset: '70%', opacity: 0.95, color: '#ffffff' },
  { offset: '82%', opacity: 0.7, color: '#ffffff' },
  { offset: '93%', opacity: 0.3, color: '#ffffff' },
  { offset: '100%', opacity: 0, color: '#000000' },
] as const;
const DESKTOP_ITEM_ARTWORK_FEATHER_STOPS = [
  { offset: '0%', opacity: 1, color: '#ffffff' },
  { offset: '68%', opacity: 1, color: '#ffffff' },
  { offset: '80%', opacity: 0.95, color: '#ffffff' },
  { offset: '90%', opacity: 0.7, color: '#ffffff' },
  { offset: '97%', opacity: 0.3, color: '#ffffff' },
  { offset: '100%', opacity: 0, color: '#000000' },
] as const;

const InventoryCellFrame = styled(YStack, {
  name: 'InventoryCell',
  position: 'relative',
  minW: 0,
  cursor: 'pointer',
  focusStyle: {
    outlineColor: '$appAccent',
    outlineStyle: 'solid',
    outlineWidth: 2,
  },
  hoverStyle: {
    opacity: 0.86,
  },
  pressStyle: {
    opacity: 0.68,
  },
  variants: {
    selected: {
      true: {
        bg: '$appAccentSubtle',
      },
      false: {},
    },
  } as const,
  defaultVariants: {
    selected: false,
  },
});

function getFirstCharacter(value: string): string {
  return Array.from(value)[0] ?? '';
}

function formatInventoryQuantity(quantity: number): string {
  return `x${quantity.toLocaleString()}`;
}

function getItemDescription(value: string | null | undefined): string | undefined {
  return value ? value.split('\\n').join('\n') : undefined;
}

export function getInventoryColumnCount(width: number, compact: boolean, gridGap: number): number {
  if (width <= 0) return compact ? DEFAULT_MOBILE_COLUMN_COUNT : DEFAULT_DESKTOP_COLUMN_COUNT;

  const minimumItemWidth = compact ? MOBILE_MIN_ITEM_WIDTH : DESKTOP_MIN_ITEM_WIDTH;
  return Math.max(1, Math.floor((width + gridGap) / (minimumItemWidth + gridGap)));
}

function getItemWidth(width: number, columnCount: number, gridGap: number): number | undefined {
  if (width <= 0) return undefined;

  return (width - gridGap * (columnCount - 1)) / columnCount;
}

function ItemArtwork({
  icon,
  itemId,
  label,
  iconSize,
  artworkSize,
  artworkScale,
  maxArtworkSize,
  testIdPrefix,
}: {
  icon: string;
  itemId: string;
  label: string;
  iconSize: number;
  artworkSize: number;
  artworkScale: number;
  maxArtworkSize: number;
  testIdPrefix: string;
}) {
  const [imageStatus, setImageStatus] = useState<'loading' | 'ready'>('loading');
  const fallbackCharacter = getFirstCharacter(label);
  const colors = getTokens().color;
  const artworkId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const maskGradientId = `item-artwork-mask-gradient-${artworkId}`;
  const maskId = `item-artwork-mask-${artworkId}`;
  const maskFill = `url(#${maskGradientId})`;
  const artworkImageUrl = getItemImageUrl(icon);
  const artworkCenter = artworkSize / 2;
  const artworkRadius = (artworkSize * artworkScale) / 2;
  const artworkInset = artworkCenter - artworkRadius;
  const artworkTransform = `translate(${artworkInset} ${artworkInset}) scale(${artworkScale})`;
  const featherStops = artworkScale < 1
    ? DESKTOP_ITEM_ARTWORK_FEATHER_STOPS
    : ITEM_ARTWORK_FEATHER_STOPS;
  const showFallback = imageStatus !== 'ready';

  return (
    <YStack width="100%" items="center" justify="center">
      <YStack
        testID={`${testIdPrefix}-circle-${itemId}`}
        width={maxArtworkSize}
        maxW="100%"
        aspectRatio={1}
        rounded={CIRCULAR_ARTWORK_RADIUS}
        overflow="hidden"
        position="relative"
      >
        <Svg
          testID={`${testIdPrefix}-feather-${itemId}`}
          width="100%"
          height="100%"
          viewBox={`0 0 ${artworkSize} ${artworkSize}`}
          preserveAspectRatio="none"
        >
          <Defs>
            <SvgRadialGradient id={maskGradientId} cx="50%" cy="50%" r="50%">
              {featherStops.map((stop) => (
                <Stop
                  key={stop.offset}
                  offset={stop.offset}
                  stopColor={stop.color}
                  stopOpacity={stop.opacity}
                />
              ))}
            </SvgRadialGradient>
            <Mask
              testID={`${testIdPrefix}-feather-mask-${itemId}`}
              id={maskId}
              width={artworkSize}
              height={artworkSize}
              maskUnits="userSpaceOnUse"
              maskContentUnits="userSpaceOnUse"
            >
              <Circle
                cx={artworkCenter}
                cy={artworkCenter}
                r={artworkRadius}
                fill={maskFill}
              />
            </Mask>
          </Defs>
          <G mask={`url(#${maskId})`}>
            <G transform={artworkTransform}>
              {showFallback ? (
                <G testID={`${testIdPrefix}-fallback-${itemId}`} aria-hidden>
                  <SvgText
                    testID={`${testIdPrefix}-fallback-character-${itemId}`}
                    transform={`translate(${artworkCenter} ${artworkCenter})`}
                    dy={(iconSize * 0.35) / artworkScale}
                    fill={colors.appMuted.val}
                    fontSize={iconSize / artworkScale}
                    fontWeight="800"
                    textAnchor="middle"
                  >
                    {fallbackCharacter}
                  </SvgText>
                </G>
              ) : null}
              <SvgImage
                testID={`${testIdPrefix}-svg-image-${itemId}`}
                href={artworkImageUrl}
                width={artworkSize}
                height={artworkSize}
                preserveAspectRatio="xMidYMid meet"
                opacity={imageStatus === 'ready' ? 1 : 0}
                onLoad={() => setImageStatus('ready')}
                accessibilityLabel={label}
              />
              <G testID={`${testIdPrefix}-filter-${itemId}`} aria-hidden>
                <AvatarFilter testID={`${testIdPrefix}-filter-svg-${itemId}`} />
              </G>
            </G>
          </G>
        </Svg>
      </YStack>
    </YStack>
  );
}

function InventoryItemArtwork({
  icon,
  itemId,
  label,
  size,
}: {
  icon: string;
  itemId: string;
  label: string;
  size: number;
}) {
  const [imageStatus, setImageStatus] = useState<'loading' | 'ready'>('loading');

  return (
    <YStack
      testID={`inventory-item-image-circle-${itemId}`}
      width={size}
      height={size}
      maxW="100%"
      rounded={CIRCULAR_ARTWORK_RADIUS}
      overflow="hidden"
      position="relative"
      items="center"
      justify="center"
    >
      {imageStatus !== 'ready' ? (
        <MonoText
          testID={`inventory-item-image-fallback-character-${itemId}`}
          position="absolute"
          size="$4"
          color="$appMuted"
          fontWeight="800"
        >
          {getFirstCharacter(label)}
        </MonoText>
      ) : null}
      <Image
        testID={`inventory-item-image-${itemId}`}
        src={getItemImageUrl(icon)}
        width="100%"
        height="100%"
        objectFit="contain"
        opacity={imageStatus === 'ready' ? 1 : 0}
        alt={label}
        onLoad={() => setImageStatus('ready')}
      />
    </YStack>
  );
}

const InventoryPreview = memo(function InventoryPreview({
  compact,
  entry,
}: {
  compact: boolean;
  entry: InventoryEntry;
}) {
  const artworkSize = compact ? MOBILE_PREVIEW_ARTWORK_SIZE : DESKTOP_PREVIEW_ARTWORK_SIZE;
  const description = getItemDescription(entry.item.description);

  return (
    <XStack
      testID="inventory-preview-details"
      width="100%"
      p={compact ? '$2.5' : '$3.5'}
      items="center"
      gap={compact ? '$2.5' : '$4'}
      bg="$appSurfaceRaisedTranslucent"
      borderBottomWidth={1}
      borderColor="$appRule"
    >
      <YStack
        testID="inventory-preview-artwork"
        width={compact ? '$7' : '$14'}
        height={compact ? '$7' : '$14'}
        shrink={0}
        items="center"
        justify="center"
        overflow="hidden"
      >
        <ItemArtwork
          key={entry.itemId}
          icon={entry.item.icon}
          itemId={entry.itemId}
          label={entry.item.name}
          iconSize={compact ? 28 : 46}
          artworkSize={artworkSize}
          artworkScale={compact ? 1 : DESKTOP_ITEM_ARTWORK_SCALE}
          maxArtworkSize={artworkSize}
          testIdPrefix="inventory-preview-image"
        />
      </YStack>
      <YStack grow={1} shrink={1} minW={0} gap="$1.5">
        <XStack items="baseline" gap="$2" minW={0}>
          <TerminalText
            testID="inventory-preview-name"
            grow={1}
            shrink={1}
            minW={0}
            size={compact ? '$4' : '$6'}
            lineHeight={compact ? '$5' : '$7'}
            fontWeight="800"
            numberOfLines={1}
          >
            {entry.item.name}
          </TerminalText>
          <MonoText shrink={0} size={compact ? '$2' : '$3'} color="$appAccent">
            {formatInventoryQuantity(entry.quantity)}
          </MonoText>
        </XStack>
        {description ? (
          <MonoText
            testID="inventory-preview-description"
            size={compact ? '$1' : '$2'}
            lineHeight={compact ? '$2.5' : '$3'}
            color="$appMuted"
            numberOfLines={compact ? 2 : 3}
          >
            {description}
          </MonoText>
        ) : null}
      </YStack>
    </XStack>
  );
});

function SelectionCorners({ itemId }: { itemId: string }) {
  return (
    <>
      <YStack testID={`inventory-selection-top-left-${itemId}`} position="absolute" t={0} l={0} width={18} height={18} borderTopWidth={2} borderLeftWidth={2} borderColor="$appMaterial" style={{ pointerEvents: 'none' }} />
      <YStack testID={`inventory-selection-top-right-${itemId}`} position="absolute" t={0} r={0} width={18} height={18} borderTopWidth={2} borderRightWidth={2} borderColor="$appAccent" style={{ pointerEvents: 'none' }} />
      <YStack testID={`inventory-selection-bottom-left-${itemId}`} position="absolute" b={0} l={0} width={18} height={18} borderBottomWidth={2} borderLeftWidth={2} borderColor="$appAccent" style={{ pointerEvents: 'none' }} />
      <YStack testID={`inventory-selection-bottom-right-${itemId}`} position="absolute" b={0} r={0} width={18} height={18} borderBottomWidth={2} borderRightWidth={2} borderColor="$appMaterial" style={{ pointerEvents: 'none' }} />
    </>
  );
}

const InventoryCell = memo(function InventoryCell({
  compact,
  entry,
  itemWidth,
  onSelect,
  rowGap,
  selected,
}: {
  compact: boolean;
  entry: InventoryEntry;
  itemWidth: number | undefined;
  onSelect: (itemId: string) => void;
  rowGap: number;
  selected: boolean;
}) {
  const artworkSize = compact ? MOBILE_ITEM_ARTWORK_SIZE : DESKTOP_ITEM_ARTWORK_SIZE;

  return (
    <InventoryCellFrame
      testID={`inventory-item-${entry.itemId}`}
      role="button"
      aria-label={`${entry.item.name}, ${entry.quantity.toLocaleString()}`}
      aria-selected={selected}
      onPress={() => onSelect(entry.itemId)}
      selected={selected}
      width={itemWidth}
      grow={itemWidth === undefined ? 1 : 0}
      mb={rowGap}
    >
      <XStack
        testID={`inventory-item-content-${entry.itemId}`}
        width="100%"
        items="center"
        justify="space-between"
        gap={compact ? '$2' : '$3'}
        px={compact ? '$2.5' : '$3'}
        py={compact ? '$1.5' : '$2'}
      >
        <YStack
          testID={`inventory-item-artwork-${entry.itemId}`}
          width={artworkSize}
          shrink={0}
          items="center"
          justify="center"
          overflow="hidden"
        >
          <InventoryItemArtwork
            icon={entry.item.icon}
            itemId={entry.itemId}
            label={entry.item.name}
            size={artworkSize}
          />
        </YStack>
        <YStack
          testID={`inventory-item-info-${entry.itemId}`}
          width={compact ? '62%' : '58%'}
          shrink={1}
          minW={0}
          items="flex-end"
          justify="center"
          gap="$1"
        >
          <TerminalText
            testID={`inventory-item-name-${entry.itemId}`}
            width="100%"
            shrink={1}
            minW={0}
            size={compact ? '$2.5' : '$3'}
            lineHeight={compact ? '$3' : '$4'}
            fontWeight="700"
            numberOfLines={2}
            text="right"
          >
            {entry.item.name}
          </TerminalText>
          <MonoText
            testID={`inventory-item-quantity-${entry.itemId}`}
            width="100%"
            shrink={0}
            size={compact ? '$2' : '$2.5'}
            lineHeight={compact ? '$2.5' : '$3'}
            color="$appAccent"
            text="right"
          >
            {formatInventoryQuantity(entry.quantity)}
          </MonoText>
        </YStack>
      </XStack>
      {selected ? <SelectionCorners itemId={entry.itemId} /> : null}
    </InventoryCellFrame>
  );
});

const InventoryRow = memo(function InventoryRow({
  compact,
  itemWidth,
  onSelect,
  row,
  rowGap,
  selectedItemId,
}: {
  compact: boolean;
  itemWidth: number | undefined;
  onSelect: (itemId: string) => void;
  row: readonly InventoryEntry[];
  rowGap: number;
  selectedItemId: string | undefined;
}) {
  return (
    <XStack
      width="100%"
      justify="flex-start"
      columnGap={rowGap}
    >
      {row.map((entry) => (
        <InventoryCell
          key={entry.itemId}
          compact={compact}
          entry={entry}
          itemWidth={itemWidth}
          onSelect={onSelect}
          rowGap={rowGap}
          selected={entry.itemId === selectedItemId}
        />
      ))}
    </XStack>
  );
});

function getInventoryRowKey(row: readonly InventoryEntry[]): string {
  return row[0]?.itemId ?? 'empty-row';
}

export function InventoryView({
  inventory,
  itemTable,
}: {
  inventory: Inventory;
  itemTable: ItemTable;
}) {
  const media = useMedia();
  const compact = Boolean(media['max-md']);
  const entries = useMemo(
    () => Object.entries(inventory).flatMap(([itemId, quantity]) => {
      const item = itemTable[itemId];
      return item ? [{ item, itemId, quantity }] : [];
    }),
    [inventory, itemTable],
  );
  const [requestedItemId, setRequestedItemId] = useState<string | null>(null);
  const selectedItemId = entries.some((entry) => entry.itemId === requestedItemId)
    ? requestedItemId
    : entries[0]?.itemId;
  const selectedEntry = entries.find((entry) => entry.itemId === selectedItemId);
  const [listWidth, setListWidth] = useState(0);
  const spaceTokens = getTokens().space;
  const gridGap = (compact ? spaceTokens['2'] : spaceTokens['3']).val;
  const columnCount = getInventoryColumnCount(listWidth, compact, gridGap);
  const itemWidth = getItemWidth(listWidth, columnCount, gridGap);
  const entryRows = useMemo(() => {
    const rows: InventoryEntry[][] = [];
    for (let index = 0; index < entries.length; index += columnCount) {
      rows.push(entries.slice(index, index + columnCount));
    }
    return rows;
  }, [columnCount, entries]);

  const handleListLayout = useCallback((width: number) => {
    setListWidth((currentWidth) => (currentWidth === width ? currentWidth : width));
  }, []);
  const renderInventoryRow = useCallback(
    ({ item: row }: ListRenderItemInfo<InventoryEntry[]>) => (
      <InventoryRow
        compact={compact}
        itemWidth={itemWidth}
        onSelect={setRequestedItemId}
        row={row}
        rowGap={gridGap}
        selectedItemId={selectedItemId ?? undefined}
      />
    ),
    [compact, gridGap, itemWidth, selectedItemId],
  );

  if (!selectedEntry) {
    return (
      <YStack testID="inventory-empty" minH={360} items="center" justify="center" gap="$3">
        <PackageOpen color={getTokens().color.appMuted.val} size={44} strokeWidth={1.25} />
      </YStack>
    );
  }

  return (
    <YStack
      grow={1}
      shrink={1}
      minH={0}
      width="100%"
      mt="$2"
      px="$2.5"
      pb="$4"
      $md={{ mt: '$3', px: '$5', pb: '$5' }}
    >
      <TerminalPanel
        testID="inventory-panel"
        cornerBrackets
        grow={1}
        shrink={1}
        minH={0}
        width="100%"
        p={0}
        overflow="hidden"
      >
        <YStack
          testID="inventory-matrix"
          grow={1}
          shrink={1}
          minH={0}
        >
          <FlatList
            testID={`inventory-grid-columns-${columnCount}`}
            data={entryRows}
            renderItem={renderInventoryRow}
            keyExtractor={getInventoryRowKey}
            ListHeaderComponent={<InventoryPreview compact={compact} entry={selectedEntry} />}
            initialNumToRender={INITIAL_ROWS_TO_RENDER}
            maxToRenderPerBatch={MAX_ROWS_PER_RENDER_BATCH}
            windowSize={VIRTUALIZED_ROW_WINDOW_SIZE}
            updateCellsBatchingPeriod={ROW_BATCHING_PERIOD_MS}
            removeClippedSubviews
            showsVerticalScrollIndicator={false}
            contentInsetAdjustmentBehavior="automatic"
            style={styles.list}
            contentContainerStyle={styles.listContent}
            onLayout={(event) => handleListLayout(event.nativeEvent.layout.width)}
          />
        </YStack>
      </TerminalPanel>
    </YStack>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    minHeight: 0,
  },
  listContent: {
    flexGrow: 1,
  },
});
