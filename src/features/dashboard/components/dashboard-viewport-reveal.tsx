import type { PropsWithChildren } from 'react';

import { type ScrollViewportMetrics, ViewportReveal } from '@/components';

type DashboardViewportRevealProps = PropsWithChildren<{
  index: number;
  origin: 'bottom' | 'left';
  viewport: ScrollViewportMetrics;
}>;

const DASHBOARD_REVEAL_AMOUNT = 0.35;
const DASHBOARD_REVEAL_DISTANCE = 24;
const DASHBOARD_REVEAL_STAGGER_MS = 40;

export function DashboardViewportReveal({
  children,
  index,
  origin,
  viewport,
}: DashboardViewportRevealProps) {
  return (
    <ViewportReveal
      amount={DASHBOARD_REVEAL_AMOUNT}
      delay={index * DASHBOARD_REVEAL_STAGGER_MS}
      viewport={viewport}
      x={origin === 'left' ? -DASHBOARD_REVEAL_DISTANCE : 0}
      y={origin === 'bottom' ? DASHBOARD_REVEAL_DISTANCE : 0}
    >
      {children}
    </ViewportReveal>
  );
}
