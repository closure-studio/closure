import { Stack } from 'expo-router/js-stack';

const WEB_SCOPE_TRANSITION = {
  animation: 'timing',
  config: { duration: 200 },
} as const;

export function AppScopeNavigator() {
  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right',
        cardStyle: { backgroundColor: 'transparent' },
        headerShown: false,
        transitionSpec: {
          close: WEB_SCOPE_TRANSITION,
          open: WEB_SCOPE_TRANSITION,
        },
      }}
    >
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
