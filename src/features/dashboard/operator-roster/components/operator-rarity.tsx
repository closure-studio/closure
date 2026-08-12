import { MonoText } from '@/components';

export function OperatorRarity({ rarity }: { rarity: number }) {
  return (
    <MonoText size="$1" color={rarity >= 6 ? '$appWarning' : rarity === 5 ? '$appAccent' : '$appMuted'}>
      {'★'.repeat(rarity)}
    </MonoText>
  );
}
