import type { ComponentRef, PropsWithChildren } from 'react';
import { forwardRef } from 'react';
import { ScrollView } from 'react-native';
import type { ScrollViewProps } from 'react-native';

export function KeyboardProvider({ children }: PropsWithChildren) {
  return children;
}

export const KeyboardAwareScrollView = forwardRef<
  ComponentRef<typeof ScrollView>,
  PropsWithChildren<ScrollViewProps>
>(function KeyboardAwareScrollView(props, ref) {
  return <ScrollView ref={ref} {...props} />;
});
