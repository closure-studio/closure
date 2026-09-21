import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import type { AuthFailure } from '@/features/auth';
import { authApi } from '@/services/api';
import type { UserSession } from '@/schemas/auth';
import type { QQBindingState } from '@/schemas/user-account';
import { FailureError, unwrapResult } from '@/utils/failure-error';

const QQ_BINDING_POLL_INTERVAL_MS = 4_000;
const QQ_BINDING_POLL_TIMEOUT_MS = 60_000;

export const QQ_BINDING_GROUPS = [
  {
    id: 'primary',
    number: '1345795',
    url: 'https://qm.qq.com/cgi-bin/qm/qr?k=YNU1S-_hVFD89w3cj8-ewkPFXXSiBRbY&jump_from=webapi&authKey=BU70QS4whXzJIi62KWNd9h8HZB5Vl2FSnjlrqYYf08RL5tbxnZhf2NMr9uLJNoYu',
  },
  {
    id: 'backup',
    number: '450555868',
    url: 'https://qm.qq.com/cgi-bin/qm/qr?k=y4He1C5OYZQPzojywTh_wlCywlfR5r-M&jump_from=webapi&authKey=13UJLWzqSVhwTXI9BPksnM7c9eogNcIdX/TC3xo6ShTAOJPgU2vlFR2rt3DxhJ2d',
  },
] as const;

export type QQBindingGroup = (typeof QQ_BINDING_GROUPS)[number];
export type QQBindingCopyStatus = 'idle' | 'copying' | 'copied' | 'error';

export type QQBindingController = {
  copyStatus: QQBindingCopyStatus;
  dialogOpen: boolean;
  error: AuthFailure | null;
  groupOpenFailed: boolean;
  isChecking: boolean;
  isFetching: boolean;
  queryStatus: 'pending' | 'error' | 'success';
  state: QQBindingState | null;
  timedOut: boolean;
  copyVerificationCode: () => Promise<void>;
  openGroup: (group: QQBindingGroup) => Promise<void>;
  retry: () => void;
  setDialogOpen: (open: boolean) => void;
  startChecking: () => void;
  stopChecking: () => void;
};

export const qqBindingQueryKeys = {
  state: (userId: string) => ['user-account', 'qq-binding', userId] as const,
};

export function useQQBindingController(session: UserSession | null): QQBindingController {
  const queryClient = useQueryClient();
  const userId = session?.principal.id ?? '';
  const [dialogOpen, setDialogOpenState] = useState(false);
  const [checkingStartedAt, setCheckingStartedAt] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [copyStatus, setCopyStatus] = useState<QQBindingCopyStatus>('idle');
  const [groupOpenFailed, setGroupOpenFailed] = useState(false);
  const checkingRequested = dialogOpen && checkingStartedAt !== null;

  const query = useQuery<QQBindingState, FailureError<AuthFailure>>({
    queryKey: qqBindingQueryKeys.state(userId),
    enabled: session !== null,
    queryFn: async ({ signal }) => {
      if (!session) {
        throw new FailureError<AuthFailure>({
          code: 'session-expired',
          kind: 'business',
        });
      }
      return unwrapResult(await authApi.fetchQQBindingState(session.accessToken, signal));
    },
    refetchInterval: (currentQuery) => checkingRequested
      && currentQuery.state.status === 'success'
      && currentQuery.state.data?.status === 'unbound'
      ? QQ_BINDING_POLL_INTERVAL_MS
      : false,
    gcTime: 0,
    retry: false,
  });

  const isChecking = checkingRequested
    && query.status === 'success'
    && query.data?.status === 'unbound'
    && !timedOut;

  useEffect(() => {
    if (!isChecking) return;
    const timeout = setTimeout(() => {
      setCheckingStartedAt(null);
      setTimedOut(true);
      void queryClient.cancelQueries({ queryKey: qqBindingQueryKeys.state(userId) });
    }, QQ_BINDING_POLL_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [isChecking, queryClient, userId]);

  const stopChecking = useCallback(() => {
    setCheckingStartedAt(null);
    void queryClient.cancelQueries({ queryKey: qqBindingQueryKeys.state(userId) });
  }, [queryClient, userId]);

  const setDialogOpen = useCallback((open: boolean) => {
    setDialogOpenState(open);
    setCopyStatus('idle');
    setGroupOpenFailed(false);
    setTimedOut(false);
    if (open) {
      if (!query.data && query.fetchStatus === 'idle') void query.refetch();
      return;
    }
    setCheckingStartedAt(null);
    void queryClient.cancelQueries({ queryKey: qqBindingQueryKeys.state(userId) });
  }, [query, queryClient, userId]);

  const startChecking = useCallback(() => {
    setTimedOut(false);
    setCheckingStartedAt(Date.now());
    void query.refetch();
  }, [query]);

  const retry = useCallback(() => {
    setCheckingStartedAt(null);
    setTimedOut(false);
    void query.refetch();
  }, [query]);

  const copyVerificationCode = useCallback(async () => {
    const verificationCode = query.data?.status === 'unbound'
      ? query.data.verificationCode
      : null;
    if (!verificationCode) return;
    setCopyStatus('copying');
    try {
      const copied = await Clipboard.setStringAsync(verificationCode);
      setCopyStatus(copied ? 'copied' : 'error');
    } catch {
      setCopyStatus('error');
    }
  }, [query.data]);

  const openGroup = useCallback(async (group: QQBindingGroup) => {
    setGroupOpenFailed(false);
    try {
      await Linking.openURL(group.url);
    } catch {
      setGroupOpenFailed(true);
    }
  }, []);

  return {
    copyStatus,
    dialogOpen,
    error: query.error?.failure ?? null,
    groupOpenFailed,
    isChecking,
    isFetching: query.isFetching,
    queryStatus: query.status,
    state: query.data ?? null,
    timedOut,
    copyVerificationCode,
    openGroup,
    retry,
    setDialogOpen,
    startChecking,
    stopChecking,
  };
}
