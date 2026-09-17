import { useTranslation } from 'react-i18next';
import {
  Toast,
  type ToastItemRenderProps,
  type ToastT,
} from '@tamagui/toast/v2';
import {
  YStack,
  getTokens,
  useMedia,
} from 'tamagui';

import { MonoText } from '@/components/ui/terminal';
import { ToastBackdrop } from './toast-backdrop';

const TOAST_DURATION_MS = 4_000;
const TOAST_GAP_PX = 8;
const TOAST_PORTAL_Z_INDEX = 100_000;

type AppToastTone = 'error' | 'info' | 'success' | 'warning';

function getToastTone(toast: ToastT): AppToastTone {
  const type = toast.type;
  return type === 'error' || type === 'info' || type === 'success' || type === 'warning'
    ? type
    : 'info';
}

const TOAST_VISUALS = {
  error: {
    accent: '$appDanger',
    scan: 'appDanger',
    wash: 'appDanger',
    washOpacity: 0.05,
  },
  info: {
    accent: '$appAccent',
    scan: 'appAccent',
    wash: 'appAccent',
    washOpacity: 0.06,
  },
  success: {
    accent: '$appSuccess',
    scan: 'appSuccess',
    wash: 'appSuccess',
    washOpacity: 0.07,
  },
  warning: {
    accent: '$appWarning',
    scan: 'appWarning',
    wash: 'appWarning',
    washOpacity: 0.05,
  },
} as const satisfies Record<AppToastTone, {
  accent: '$appAccent' | '$appDanger' | '$appSuccess' | '$appWarning';
  scan: 'appAccent' | 'appDanger' | 'appSuccess' | 'appWarning';
  wash: 'appAccent' | 'appDanger' | 'appSuccess' | 'appWarning';
  washOpacity: number;
}>;

function AppToastItem({ index, toast, tone }: ToastItemRenderProps & { tone: AppToastTone }) {
  const visual = TOAST_VISUALS[tone];
  const colors = getTokens().color;
  const title = typeof toast.title === 'function' ? toast.title() : toast.title;
  const description = typeof toast.description === 'function'
    ? toast.description()
    : toast.description;

  return (
    <Toast.Item
      toast={toast}
      index={index}
      unstyled
      testID={`app-toast-${tone}`}
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      width="100%"
      maxW={420}
      self="center"
      $large={{ self: 'flex-end' }}
      px="$2.5"
      py="$2"
      overflow="hidden"
      bg="$appSurfaceRaised"
      borderWidth={0}
      borderLeftWidth={4}
      borderLeftColor={visual.accent}
      rounded="$1"
      focusVisibleStyle={{
        outlineColor: '$appText',
        outlineStyle: 'solid',
        outlineWidth: 2,
      }}
    >
      <ToastBackdrop
        scanColor={colors[visual.scan].val}
        scanDurationMs={TOAST_DURATION_MS}
        washColor={colors[visual.wash].val}
        washOpacity={visual.washOpacity}
      />
      <YStack grow={1} shrink={1} minW={0} gap="$0.5" justify="center">
        <MonoText
          size="$2"
          lineHeight="$2.5"
          fontWeight="400"
          letterSpacing={0}
          color="$appText"
        >
          {title}
        </MonoText>
        {description ? (
          <MonoText size="$1" lineHeight="$2" letterSpacing={0} color="$appText" opacity={0.75}>
            {description}
          </MonoText>
        ) : null}
      </YStack>
    </Toast.Item>
  );
}

function renderToastItem(props: ToastItemRenderProps) {
  return <AppToastItem {...props} tone={getToastTone(props.toast)} />;
}

export function AppToastHost() {
  const { t } = useTranslation('common');
  const { large } = useMedia();
  const tokens = getTokens();
  const edgeOffset = large ? tokens.space[4].val : tokens.space[3].val;

  return (
    <Toast
      position={large ? 'top-right' : 'top-center'}
      duration={TOAST_DURATION_MS}
      gap={TOAST_GAP_PX}
      visibleToasts={1}
      swipeDirection="auto"
    >
      <Toast.Viewport
        testID="app-toast-viewport"
        portalZIndex={TOAST_PORTAL_Z_INDEX}
        mt={edgeOffset}
        offset={{ top: 0, right: edgeOffset, bottom: 0, left: edgeOffset }}
        $platform-web={{ maxW: `calc(100vw - ${edgeOffset * 2}px)` }}
        label={t('accessibility.notifications')}
      >
        <Toast.List renderItem={renderToastItem} />
      </Toast.Viewport>
    </Toast>
  );
}
