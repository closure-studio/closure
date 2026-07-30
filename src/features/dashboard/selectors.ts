import type { GameAccount } from '@/schemas/game-account';

export type BackdropTints = Record<GameAccount['color'], string>;

export function selectActiveGameAccount(gameAccounts: readonly GameAccount[], activeGameAccountId: string) {
  const activeGameAccount = gameAccounts.find((gameAccount) => gameAccount.id === activeGameAccountId)
    ?? gameAccounts[0];

  if (!activeGameAccount) throw new Error('Dashboard requires at least one Game Account.');
  return activeGameAccount;
}

export function selectBackdropTint(gameAccount: GameAccount, backdropTints: BackdropTints) {
  return backdropTints[gameAccount.color];
}
