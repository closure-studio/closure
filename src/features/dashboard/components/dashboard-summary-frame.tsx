import { Frame } from '@/components';
import type { FrameProps } from '@/components';

export type DashboardSummarySection =
  | 'profile'
  | 'sanity'
  | 'asset-gold'
  | 'asset-orundum'
  | 'asset-originium'
  | 'asset-recruit-tickets'
  | 'operation-map'
  | 'operation-auto-battle'
  | 'operation-base-arrange'
  | 'operation-keeping-ap'
  | 'base'
  | 'logs';

export function formatDashboardSummaryTitle(title: string): string {
  return `// ${title}`;
}

type DashboardSummaryFrameProps = Omit<
  FrameProps,
  'aria-label' | 'aria-pressed' | 'cornerBrackets' | 'onPress' | 'role' | 'selected'
> & {
  activeSection: DashboardSummarySection;
  label: string;
  onActivate: (section: DashboardSummarySection) => void;
  section: DashboardSummarySection;
};

export function DashboardSummaryFrame({
  activeSection,
  children,
  label,
  onActivate,
  section,
  ...props
}: DashboardSummaryFrameProps) {
  const selected = activeSection === section;

  return (
    <Frame
      {...props}
      selected={selected}
      role="button"
      aria-label={label}
      aria-pressed={selected}
      onPress={() => onActivate(section)}
      cursor="pointer"
      hoverStyle={{ opacity: 0.9 }}
      pressStyle={{ opacity: 0.72 }}
      focusVisibleStyle={{ outlineColor: '$appAccent', outlineStyle: 'solid', outlineWidth: 1 }}
    >
      {children}
    </Frame>
  );
}
