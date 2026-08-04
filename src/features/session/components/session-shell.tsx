import { createContext, useCallback, useContext, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { XStack, YStack, getTokens } from 'tamagui';

import { TerminalBackdrop } from '@/components';

type SessionBackdropContextValue = {
  resetBackdropTint: () => void;
  setBackdropTint: (tint: string) => void;
};

const SessionBackdropContext = createContext<SessionBackdropContextValue | null>(null);

export function SessionShell({ children }: PropsWithChildren) {
  const colors = getTokens().color;
  const defaultBackdropTint = colors.terminalCyan.val;
  const [backdropTint, setBackdropTint] = useState(defaultBackdropTint);
  const resetBackdropTint = useCallback(() => {
    setBackdropTint(defaultBackdropTint);
  }, [defaultBackdropTint]);

  return (
    <SessionBackdropContext.Provider value={{ resetBackdropTint, setBackdropTint }}>
      <XStack
        grow={1}
        justify="center"
        bg="$black1"
        $platform-web={{ height: '100dvh', maxH: '100dvh', overflow: 'hidden' }}
      >
        <YStack
          grow={1}
          width="100%"
          height="100%"
          maxW={460}
          maxH="100%"
          borderLeftWidth={1}
          borderRightWidth={1}
          borderColor="$terminalBorder"
          overflow="hidden"
          bg="$terminalBg"
          $md={{ maxW: '100%', borderLeftWidth: 0, borderRightWidth: 0 }}
        >
          <TerminalBackdrop tint={backdropTint} />
          <SafeAreaView
            edges={['top', 'right', 'left']}
            style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
          >
            <YStack grow={1} minH={0} height="100%" overflow="hidden">
              {children}
            </YStack>
          </SafeAreaView>
        </YStack>
      </XStack>
    </SessionBackdropContext.Provider>
  );
}

export function useSessionBackdrop() {
  const backdrop = useContext(SessionBackdropContext);
  if (!backdrop) throw new Error('useSessionBackdrop must be used within a SessionShell.');
  return backdrop;
}
