import { lazy, Suspense, useSyncExternalStore } from 'react';

import { SkiaWebLoader } from './skia-web-loader';

const LazyFlowParticleField = lazy(() => import('./flow-particle-field'));
const subscribeToHydrationState = () => () => {};
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

export function TerminalMotionField({
  width,
  height,
  tint,
  secondaryTint,
}: {
  width: number;
  height: number;
  tint: string;
  secondaryTint: string;
}) {
  const isClientHydrated = useSyncExternalStore(
    subscribeToHydrationState,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );

  if (!isClientHydrated) return null;

  return (
    <Suspense fallback={null}>
      <SkiaWebLoader />
      <LazyFlowParticleField
        key={`${width}:${height}`}
        width={width}
        height={height}
        tint={tint}
        secondaryTint={secondaryTint}
      />
    </Suspense>
  );
}
