import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Button, YStack } from 'tamagui';
import * as v from 'valibot';
import { useAppStore } from '@/store';
import { gameCaptchaSubmissionSchema } from '@/schemas/arkhost';
import type { UserSession } from '@/schemas/auth';
import type { GameAccount } from '@/schemas/game-account';
import { finishVerification, useVerificationRequest } from '@/features/verification';
import { verifyGame } from '@/services/api';
import { requestScope, assertActive } from '@/services/request-scope';
import { arkHostQueryKeys, useGameAccountsQuery, useSubmitGameCaptcha } from './queries';

type VerificationStatus = 'pending' | 'done' | 'dismissed';

function challengeKey(game: GameAccount) {
  return JSON.stringify([game.account, game.captchaInfo.created, game.captchaInfo.challenge]);
}

export function GameVerification() {
  const session = useAppStore((state) => state.auth.session);
  const node = useAppStore((state) => state.selectedApiNodeId);
  if (!session) return null;
  return <CurrentGameVerification key={JSON.stringify([session.accessToken, node])} session={session} />;
}

function CurrentGameVerification({ session }: {
  session: UserSession;
}) {
  const { data: games } = useGameAccountsQuery();
  const { mutateAsync: submitCaptcha } = useSubmitGameCaptcha();
  const queryClient = useQueryClient();
  const active = useVerificationRequest();
  const [statuses, setStatuses] = useState<Record<string, VerificationStatus>>({});
  const { t } = useTranslation('auth');
  const mark = useCallback((key: string, status: VerificationStatus | null) => {
    setStatuses((previous) => {
      const next = { ...previous };
      if (status === null) delete next[key];
      else next[key] = status;
      return next;
    });
  }, []);

  useEffect(() => {
    if (active?.kind !== 'game' || !games) return;
    const current = games.find((game) => game.account === active.account);
    if (!current || current.captchaInfo.created !== active.captcha.created
      || current.captchaInfo.challenge !== active.captcha.challenge) {
      finishVerification(active, null);
    }
  }, [games, active]);
  useEffect(() => {
    if (active) return;
    const game = games?.find((candidate) =>
      (candidate.captchaInfo.challenge || candidate.captchaInfo.geetestId)
      && !statuses[challengeKey(candidate)]);
    if (!game) return;
    const key = challengeKey(game);
    const scope = requestScope();
    const process = async () => {
      try {
        await Promise.resolve();
        assertActive(scope);
        mark(key, 'pending');
        const result = await verifyGame({ kind: 'game', account: game.account, captcha: game.captchaInfo }, scope);
        assertActive(scope);
        const current = queryClient.getQueryData<GameAccount[]>(
          arkHostQueryKeys.gameAccounts(session.principal.id),
        )?.find((candidate) => candidate.account === game.account);
        if (!current || challengeKey(current) !== key) return;
        await submitCaptcha({ account: game.account, captcha: v.parse(gameCaptchaSubmissionSchema, result) });
        assertActive(scope);
        mark(key, 'done');
        await queryClient.invalidateQueries({ queryKey: arkHostQueryKeys.gameAccounts(session.principal.id) });
      } catch {
        if (!scope.aborted) mark(key, 'dismissed');
      }
    };
    void process();
  }, [games, active, statuses, queryClient, session, submitCaptcha, mark]);

  const dismissed = games?.filter((game) => statuses[challengeKey(game)] === 'dismissed');
  if (!dismissed?.length) return null;
  return <YStack position="absolute" b="$6" l="$3" r="$3" z={1000} gap="$2">{dismissed.map((game) => <Button key={game.account} onPress={() => mark(challengeKey(game), null)}>{t('verification.retryAccount', { account: game.account })}</Button>)}</YStack>;
}
