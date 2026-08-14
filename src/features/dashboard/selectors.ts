import type { GameAccount } from '@/schemas/game-account';

export type BackdropTints = Record<GameAccount['color'], string>;

export function selectBackdropTint(gameAccount: Pick<GameAccount, 'color'> | null, backdropTints: BackdropTints) {
  return gameAccount ? backdropTints[gameAccount.color] : backdropTints.muted;
}
