import {
  createContext,
  type PropsWithChildren,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import type { LayoutChangeEvent, LayoutRectangle } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { XStack, YStack, withStaticProperties } from 'tamagui';

type SelectionLayout = Pick<LayoutRectangle, 'x' | 'y' | 'width' | 'height'>;

type SlidingSelectionContextValue = {
  registerItemLayout: (value: string, layout: SelectionLayout) => void;
  unregisterItemLayout: (value: string) => void;
};

const SlidingSelectionContext = createContext<SlidingSelectionContextValue | null>(null);

type SlidingSelectionProps = PropsWithChildren<{
  gap?: number;
  indicator: ReactNode;
  value: string;
}>;

const indicatorSpringConfig = {
  damping: 34,
  mass: 1,
  stiffness: 400,
} as const;

function SlidingSelectionFrame({ children, gap = 8, indicator, value }: SlidingSelectionProps) {
  const itemLayouts = useRef(new Map<string, SelectionLayout>());
  const selectedValueRef = useRef(value);
  const hasMeasuredSelection = useRef(false);
  const reducedMotion = useReducedMotion();
  const indicatorReady = useSharedValue(0);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const width = useSharedValue(0);
  const height = useSharedValue(0);

  useEffect(() => {
    selectedValueRef.current = value;
  }, [value]);

  const moveIndicatorTo = useCallback((layout: SelectionLayout, animate: boolean) => {
    if (!animate || reducedMotion) {
      cancelAnimation(x);
      cancelAnimation(y);
      cancelAnimation(width);
      cancelAnimation(height);
      x.set(layout.x);
      y.set(layout.y);
      width.set(layout.width);
      height.set(layout.height);
    } else {
      x.set(withSpring(layout.x, indicatorSpringConfig));
      y.set(withSpring(layout.y, indicatorSpringConfig));
      width.set(withSpring(layout.width, indicatorSpringConfig));
      height.set(withSpring(layout.height, indicatorSpringConfig));
    }
    hasMeasuredSelection.current = true;
    indicatorReady.set(1);
  }, [height, indicatorReady, reducedMotion, width, x, y]);

  const registerItemLayout = useCallback((itemValue: string, layout: SelectionLayout) => {
    itemLayouts.current.set(itemValue, layout);
    if (itemValue === selectedValueRef.current) moveIndicatorTo(layout, hasMeasuredSelection.current);
  }, [moveIndicatorTo]);

  const unregisterItemLayout = useCallback((itemValue: string) => {
    itemLayouts.current.delete(itemValue);
    if (itemValue === selectedValueRef.current) {
      hasMeasuredSelection.current = false;
      indicatorReady.set(0);
    }
  }, [indicatorReady]);

  useEffect(() => {
    const layout = itemLayouts.current.get(value);
    if (layout) moveIndicatorTo(layout, hasMeasuredSelection.current);
  }, [moveIndicatorTo, value]);

  const context = useMemo(() => ({ registerItemLayout, unregisterItemLayout }), [registerItemLayout, unregisterItemLayout]);
  const indicatorStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: indicatorReady.value,
    transform: [{ translateX: x.value }, { translateY: y.value }],
    width: width.value,
  }));

  return (
    <SlidingSelectionContext.Provider value={context}>
      <XStack position="relative" self="flex-start" gap={gap}>
        {children}
        <Animated.View
          style={[{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }, indicatorStyle]}
        >
          {indicator}
        </Animated.View>
      </XStack>
    </SlidingSelectionContext.Provider>
  );
}

type SlidingSelectionItemProps = PropsWithChildren<{
  value: string;
}>;

function SlidingSelectionItem({ children, value }: SlidingSelectionItemProps) {
  const context = useContext(SlidingSelectionContext);
  if (!context) throw new Error('SlidingSelection.Item must be used inside SlidingSelection');

  useEffect(() => () => context.unregisterItemLayout(value), [context, value]);

  const handleLayout = (event: LayoutChangeEvent) => {
    context.registerItemLayout(value, event.nativeEvent.layout);
  };

  return (
    <YStack shrink={0} onLayout={handleLayout}>
      {children}
    </YStack>
  );
}

export const SlidingSelection = withStaticProperties(SlidingSelectionFrame, {
  Item: SlidingSelectionItem,
});
