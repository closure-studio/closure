import type { GameAccount } from '@/schemas/game-account';

export type BackdropTints = Record<GameAccount['color'], string>;

export function selectBackdropTint(gameAccount: GameAccount, backdropTints: BackdropTints) {
  return backdropTints[gameAccount.color];
}
