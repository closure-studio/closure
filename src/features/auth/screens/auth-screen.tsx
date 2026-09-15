import { useRef } from 'react';
import type { ReactNode } from 'react';
import { useReducedMotion } from 'react-native-reanimated';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { XStack, YStack, getTokens } from 'tamagui';

import { DecorativeBarcode, FlickeringStatusIndicator, MonoText } from '@/components';
import { AccessOrbit } from '../components/access-orbit';
import { TerminalBrand } from '../components/terminal-brand';

const ACCESS_ORBIT_NODE_ID = '07';
const REQUEST_MODE_SWITCH_PRESS_COUNT = 5;

type AuthScreenProps = {
  children: ReactNode;
  onToggleRequestMode: () => void;
};

export function AuthScreen({ children, onToggleRequestMode }: AuthScreenProps) {
  const { t } = useTranslation('auth');
  const colors = getTokens().color;
  const reducedMotion = useReducedMotion();
  const requestModePressCount = useRef(0);

  const handleBrandMarkPress = () => {
    requestModePressCount.current += 1;
    if (requestModePressCount.current === REQUEST_MODE_SWITCH_PRESS_COUNT) {
      onToggleRequestMode();
    }
  };

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
      <KeyboardAwareScrollView
        mode="insets"
        bottomOffset={getTokens().space[4].val}
        keyboardDismissMode={process.env.EXPO_OS === 'ios' ? 'interactive' : 'on-drag'}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <YStack width="100%" maxW={1120} minH="100%" grow={1} self="center" px="$3.5" pt="$4" pb="$4" $large={{ px: '$6', pt: '$5', pb: '$4' }}>
          <XStack testID="auth-screen-main" grow={1} items="center" justify="flex-start" flexDirection="column" py="$3" gap="$5" $large={{ grow: 0, my: 'auto', minH: 680, flexDirection: 'row', items: 'flex-start', justify: 'center', gap: '$8', px: '$3', py: '$5' }}>
            <YStack position="relative" width="100%" maxW={460} minW={0} shrink={1} transition={reducedMotion ? '0ms' : '500ms'} enterStyle={reducedMotion ? null : { opacity: 0, y: 18 }} opacity={1} y={0} gap="$3" $large={{ grow: 1, flexBasis: 0, pt: '$10' }}>
                <AccessOrbit label={t('hero.orbitLabel')} nodeId={ACCESS_ORBIT_NODE_ID} />
                <TerminalBrand
                  markAccessibilityLabel={t('environment.markLabel')}
                  onMarkPress={handleBrandMarkPress}
                />
                <MonoText display="none" size="$2" lineHeight="$4" $large={{ display: 'flex' }}>{t('meta.description')}</MonoText>
                <DecorativeBarcode />
                <YStack display="none" gap="$2" pt="$2" $large={{ display: 'flex' }}>
                  <XStack items="center" gap="$2"><FlickeringStatusIndicator color={colors.appSuccess.val} /><MonoText size="$1">{t('meta.secureChannel')}</MonoText></XStack>
                  <XStack items="center" gap="$2"><YStack width={6} height={6} rounded="$10" bg="$appAccent" /><MonoText size="$1">{t('meta.syncReady')}</MonoText></XStack>
                </YStack>
            </YStack>

            <YStack width="100%" maxW={460} minW={0} shrink={1} gap="$3" $large={{ grow: 1, flexBasis: 0 }}>
              {children}
            </YStack>
          </XStack>

          <XStack flexDirection="column" items="center" gap="$1" mt="$4" pt="$3" borderTopWidth={1} borderColor="$appBorder" $large={{ flexDirection: 'row', justify: 'space-between', items: 'center' }}>
            <MonoText size="$1" shrink={1} self="stretch" text="center" $large={{ self: 'auto', text: 'left' }}>{t('meta.footer')}</MonoText>
            <MonoText size="$1" color="$appAccent" shrink={1} self="stretch" text="center" $large={{ self: 'auto', text: 'right' }}>{t('meta.syncReady')}</MonoText>
          </XStack>
        </YStack>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
