import '../tamagui.generated.css';

import {
  Oxanium_400Regular,
  Oxanium_500Medium,
  Oxanium_600SemiBold,
  Oxanium_700Bold,
  Oxanium_800ExtraBold,
} from '@expo-google-fonts/oxanium';
import {
  GeistMono_400Regular,
  GeistMono_500Medium,
  GeistMono_600SemiBold,
  GeistMono_700Bold,
  GeistMono_800ExtraBold,
  GeistMono_900Black,
} from '@expo-google-fonts/geist-mono';
import { useFonts } from 'expo-font';
import { DarkTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TamaguiProvider } from 'tamagui';

import { tamaguiConfig } from '../../tamagui.config';
import { LocalizationProvider } from './localization-provider';
import { LayoutSizeProvider } from './layout-size-provider';

SplashScreen.preventAutoHideAsync().catch((splashError: unknown) => {
  console.warn('Unable to keep the splash screen visible.', splashError);
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

export function AppProvider({ children }: PropsWithChildren) {
  const [loaded, error] = useFonts({
    Oxanium_400Regular,
    Oxanium_500Medium,
    Oxanium_600SemiBold,
    Oxanium_700Bold,
    Oxanium_800ExtraBold,
    GeistMono_400Regular,
    GeistMono_500Medium,
    GeistMono_600SemiBold,
    GeistMono_700Bold,
    GeistMono_800ExtraBold,
    GeistMono_900Black,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch((splashError: unknown) => {
        console.warn('Unable to hide the splash screen.', splashError);
      });
    }
  }, [error, loaded]);

  if (!loaded && !error) return null;

  return (
    <LocalizationProvider>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <LayoutSizeProvider>
          <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <ThemeProvider value={DarkTheme}>
                <StatusBar style="light" />
                {children}
              </ThemeProvider>
            </GestureHandlerRootView>
          </QueryClientProvider>
        </LayoutSizeProvider>
      </TamaguiProvider>
    </LocalizationProvider>
  );
}
