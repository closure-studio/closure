import { MonoText } from '@/components';

export function OperatorRarity({ rarity }: { rarity: number }) {
  return (
    <MonoText size="$1" color={rarity >= 6 ? '$terminalWarning' : rarity === 5 ? '$terminalCyan' : '$terminalMuted'}>
      {'★'.repeat(rarity)}
    </MonoText>
  );
}
