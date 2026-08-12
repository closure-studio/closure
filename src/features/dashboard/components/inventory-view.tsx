import { PackageOpen } from 'lucide-react-native';
import { memo, useId, useMemo, useState } from 'react';
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
import { Image, XStack, YStack, getTokens, styled } from 'tamagui';

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
const INVENTORY_MIN_ITEM_WIDTH = 128;
const INVENTORY_GRID_GAP_TOKEN = '$2';
const ITEM_ARTWORK_SIZE = 40;
const PREVIEW_ARTWORK_SIZE = 56;
const PREVIEW_FALLBACK_ICON_SIZE = 28;
const PREVIEW_ARTWORK_FEATHER_STOPS = [
  { offset: '0%', opacity: 1, color: '#ffffff' },
  { offset: '58%', opacity: 1, color: '#ffffff' },
  { offset: '70%', opacity: 0.95, color: '#ffffff' },
  { offset: '82%', opacity: 0.7, color: '#ffffff' },
  { offset: '93%', opacity: 0.3, color: '#ffffff' },
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

export function getInventoryGridLayout(containerWidth: number, gap: number) {
  if (containerWidth <= 0) {
    return { columnCount: 1, itemWidth: undefined };
  }

  const columnCount = Math.max(
    1,
    Math.floor((containerWidth + gap) / (INVENTORY_MIN_ITEM_WIDTH + gap)),
  );

  return {
    columnCount,
    itemWidth: (containerWidth - gap * (columnCount - 1)) / columnCount,
  };
}

function InventoryPreviewArtwork({
  icon,
  itemId,
  label,
}: {
  icon: string;
  itemId: string;
  label: string;
}) {
  const [imageStatus, setImageStatus] = useState<'loading' | 'ready'>('loading');
  const fallbackCharacter = getFirstCharacter(label);
  const colors = getTokens().color;
  const artworkId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const maskGradientId = `item-artwork-mask-gradient-${artworkId}`;
  const maskId = `item-artwork-mask-${artworkId}`;
  const maskFill = `url(#${maskGradientId})`;
  const artworkImageUrl = getItemImageUrl(icon);
  const artworkCenter = PREVIEW_ARTWORK_SIZE / 2;
  const showFallback = imageStatus !== 'ready';

  return (
    <YStack width="100%" items="center" justify="center">
      <YStack
        testID={`inventory-preview-image-circle-${itemId}`}
        width={PREVIEW_ARTWORK_SIZE}
        maxW="100%"
        aspectRatio={1}
        rounded={CIRCULAR_ARTWORK_RADIUS}
        overflow="hidden"
        position="relative"
      >
        <Svg
          testID={`inventory-preview-image-feather-${itemId}`}
          width="100%"
          height="100%"
          viewBox={`0 0 ${PREVIEW_ARTWORK_SIZE} ${PREVIEW_ARTWORK_SIZE}`}
          preserveAspectRatio="none"
        >
          <Defs>
            <SvgRadialGradient id={maskGradientId} cx="50%" cy="50%" r="50%">
              {PREVIEW_ARTWORK_FEATHER_STOPS.map((stop) => (
                <Stop
                  key={stop.offset}
                  offset={stop.offset}
                  stopColor={stop.color}
                  stopOpacity={stop.opacity}
                />
              ))}
            </SvgRadialGradient>
            <Mask
              testID={`inventory-preview-image-feather-mask-${itemId}`}
              id={maskId}
              width={PREVIEW_ARTWORK_SIZE}
              height={PREVIEW_ARTWORK_SIZE}
              maskUnits="userSpaceOnUse"
              maskContentUnits="userSpaceOnUse"
            >
              <Circle
                cx={artworkCenter}
                cy={artworkCenter}
                r={artworkCenter}
                fill={maskFill}
              />
            </Mask>
          </Defs>
          <G mask={`url(#${maskId})`}>
            {showFallback ? (
              <G testID={`inventory-preview-image-fallback-${itemId}`} aria-hidden>
                <SvgText
                  testID={`inventory-preview-image-fallback-character-${itemId}`}
                  transform={`translate(${artworkCenter} ${artworkCenter})`}
                  dy={PREVIEW_FALLBACK_ICON_SIZE * 0.35}
                  fill={colors.appMuted.val}
                  fontSize={PREVIEW_FALLBACK_ICON_SIZE}
                  fontWeight="800"
                  textAnchor="middle"
                >
                  {fallbackCharacter}
                </SvgText>
              </G>
            ) : null}
            <SvgImage
              testID={`inventory-preview-image-svg-image-${itemId}`}
              href={artworkImageUrl}
              width={PREVIEW_ARTWORK_SIZE}
              height={PREVIEW_ARTWORK_SIZE}
              preserveAspectRatio="xMidYMid meet"
              opacity={imageStatus === 'ready' ? 1 : 0}
              onLoad={() => setImageStatus('ready')}
              accessibilityLabel={label}
            />
            <G testID={`inventory-preview-image-filter-${itemId}`} aria-hidden>
              <AvatarFilter testID={`inventory-preview-image-filter-svg-${itemId}`} />
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
}: {
  icon: string;
  itemId: string;
  label: string;
}) {
  const [imageStatus, setImageStatus] = useState<'loading' | 'ready'>('loading');

  return (
    <YStack
      testID={`inventory-item-image-circle-${itemId}`}
      width={ITEM_ARTWORK_SIZE}
      height={ITEM_ARTWORK_SIZE}
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

const InventoryPreview = memo(function InventoryPreview({ entry }: { entry: InventoryEntry }) {
  const description = getItemDescription(entry.item.description);

  return (
    <XStack
      testID="inventory-preview-details"
      width="100%"
      p="$2.5"
      items="center"
      gap="$2.5"
      bg="$appSurfaceRaisedTranslucent"
      borderBottomWidth={1}
      borderColor="$appRule"
    >
      <YStack
        testID="inventory-preview-artwork"
        width="$7"
        height="$7"
        shrink={0}
        items="center"
        justify="center"
        overflow="hidden"
      >
        <InventoryPreviewArtwork
          key={entry.itemId}
          icon={entry.item.icon}
          itemId={entry.itemId}
          label={entry.item.name}
        />
      </YStack>
      <YStack grow={1} shrink={1} minW={0} gap="$1.5">
        <XStack items="baseline" gap="$2" minW={0}>
          <TerminalText
            testID="inventory-preview-name"
            grow={1}
            shrink={1}
            minW={0}
            size="$4"
            lineHeight="$5"
            fontWeight="800"
            numberOfLines={1}
          >
            {entry.item.name}
          </TerminalText>
          <MonoText shrink={0} size="$2" color="$appAccent">
            {formatInventoryQuantity(entry.quantity)}
          </MonoText>
        </XStack>
        {description ? (
          <MonoText
            testID="inventory-preview-description"
            size="$1"
            lineHeight="$2.5"
            color="$appMuted"
            numberOfLines={2}
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
  entry,
  itemWidth,
  onSelect,
  selected,
}: {
  entry: InventoryEntry;
  itemWidth: number | undefined;
  onSelect: (itemId: string) => void;
  selected: boolean;
}) {
  return (
    <InventoryCellFrame
      testID={`inventory-item-${entry.itemId}`}
      role="button"
      aria-label={`${entry.item.name}, ${entry.quantity.toLocaleString()}`}
      aria-selected={selected}
      onPress={() => onSelect(entry.itemId)}
      selected={selected}
      width={itemWidth ?? '100%'}
    >
      <XStack
        testID={`inventory-item-content-${entry.itemId}`}
        width="100%"
        items="center"
        justify="space-between"
        gap="$2"
        px="$2.5"
        py="$1.5"
      >
        <YStack
          testID={`inventory-item-artwork-${entry.itemId}`}
          width={ITEM_ARTWORK_SIZE}
          shrink={0}
          items="center"
          justify="center"
          overflow="hidden"
        >
          <InventoryItemArtwork
            icon={entry.item.icon}
            itemId={entry.itemId}
            label={entry.item.name}
          />
        </YStack>
        <YStack
          testID={`inventory-item-info-${entry.itemId}`}
          width="62%"
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
            size="$2.5"
            lineHeight="$3"
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
            size="$2"
            lineHeight="$2.5"
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

export function InventoryView({
  inventory,
  itemTable,
}: {
  inventory: Inventory;
  itemTable: ItemTable;
}) {
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
  const gridGap = getTokens().space[INVENTORY_GRID_GAP_TOKEN].val;
  const { columnCount, itemWidth } = getInventoryGridLayout(listWidth, gridGap);

  if (!selectedEntry) {
    return (
      <YStack testID="inventory-empty" minH={360} items="center" justify="center" gap="$3">
        <PackageOpen color={getTokens().color.appMuted.val} size={44} strokeWidth={1.25} />
      </YStack>
    );
  }

  return (
    <YStack width="100%">
      <TerminalPanel
        testID="inventory-panel"
        cornerBrackets
        width="100%"
        p={0}
      >
        <InventoryPreview entry={selectedEntry} />
        <XStack
          testID={`inventory-grid-columns-${columnCount}`}
          width="100%"
          flexWrap="wrap"
          gap={gridGap}
          onLayout={(event) => {
            const width = event.nativeEvent.layout.width;
            setListWidth((currentWidth) => (currentWidth === width ? currentWidth : width));
          }}
        >
          {entries.map((entry) => (
            <InventoryCell
              key={entry.itemId}
              entry={entry}
              itemWidth={itemWidth}
              onSelect={setRequestedItemId}
              selected={entry.itemId === selectedItemId}
            />
          ))}
        </XStack>
      </TerminalPanel>
    </YStack>
  );
}