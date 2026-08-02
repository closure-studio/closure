import { Slot } from 'expo-router';

import { DashboardProvider } from '@/features/dashboard';

export default function DashboardLayout() {
  return (
    <DashboardProvider>
      <Slot />
    </DashboardProvider>
  );
}
