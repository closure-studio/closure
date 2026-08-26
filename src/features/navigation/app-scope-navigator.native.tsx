import { Stack } from 'expo-router/stack';

export function AppScopeNavigator() {
  return (
    <Stack
      screenOptions={{
        animation: 'default',
        contentStyle: { backgroundColor: 'transparent' },
        headerShown: false,
      }}
    >
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
