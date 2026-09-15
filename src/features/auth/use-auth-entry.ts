import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { AuthFormSubmission } from '@/schemas/auth';
import type { PostLoginDestination } from '@/routing/auth-routing';
import { assertActive, requestScope } from '@/services/request-scope';
import { authorizeLinuxDo, consumeLinuxDoCallback, linuxDoLoginAvailable } from '@/services/api';
import { appStore, useAppStore } from '@/store';
import { FailureError } from '@/utils/failure-error';
import type { AccountFormsProps, AuthEntryView } from './components/account-forms';
import { authFailureMessage } from './failure-messages';
import { watchAbandonedLinuxDoAuthorization } from './linuxdo';
import { useAuthSubmission, useEmailCode } from './queries';
import type { AuthSubmissionResult } from './queries';

type AuthEntry = { view: AuthEntryView; email: string };
type Operation = {
  controller: AbortController;
  detach: () => void;
};
type AuthorizationFeedback = Error | 'pending' | null;

function authorizationFailure(code: 'oauth-cancelled' | 'oauth-expired') {
  return new FailureError({ code, kind: 'authorization' });
}

function matchesView(submission: AuthFormSubmission, view: AuthEntryView): boolean {
  return (submission.kind === 'login' && view === 'login')
    || (submission.kind === 'register' && view === 'register')
    || (submission.kind === 'reset-password' && view === 'reset');
}

export function useAuthEntry(returnTo: PostLoginDestination) {
  const session = useAppStore((state) => state.auth.session);
  const [entry, setEntry] = useState<AuthEntry>({ view: 'login', email: '' });
  const entryRef = useRef(entry);
  const operationRef = useRef<Operation | null>(null);
  const [authorization, setAuthorization] = useState<AuthorizationFeedback>(null);
  const submission = useAuthSubmission();
  const emailCode = useEmailCode();
  const { t } = useTranslation('auth');
  const resetSubmission = submission.reset;
  const resetEmailCode = emailCode.reset;

  const release = (operation: Operation) => {
    operation.detach();
    if (operationRef.current === operation) operationRef.current = null;
  };
  const cancel = () => {
    const operation = operationRef.current;
    if (!operation) return;
    operation.controller.abort();
    release(operation);
  };
  const reset = () => {
    setAuthorization(null);
    resetSubmission();
    resetEmailCode();
  };
  const start = (): Operation | null => {
    if (operationRef.current || requestScope().aborted || appStore.getState().auth.session) return null;
    const parent = requestScope();
    const controller = new AbortController();
    const abort = () => controller.abort();
    parent.addEventListener('abort', abort, { once: true });
    if (parent.aborted) controller.abort();
    const operation = {
      controller,
      detach: () => parent.removeEventListener('abort', abort),
    };
    operationRef.current = operation;
    reset();
    return operation;
  };
  const accept = (operation: Operation, result: AuthSubmissionResult) => {
    if (operationRef.current !== operation || operation.controller.signal.aborted) return;
    if (result.kind === 'session') appStore.getState().setSession(result.session);
  };

  useEffect(() => () => {
    operationRef.current?.controller.abort();
    operationRef.current?.detach();
    operationRef.current = null;
  }, []);
  useEffect(() => watchAbandonedLinuxDoAuthorization((code) => {
    const operation = operationRef.current;
    if (operation) {
      operation.controller.abort();
      operation.detach();
      operationRef.current = null;
    }
    resetSubmission();
    resetEmailCode();
    setAuthorization(authorizationFailure(code));
  }), [resetEmailCode, resetSubmission]);

  const mutationKind = submission.variables?.submission.kind;
  const submissionKind = authorization ? 'linuxdo'
    : mutationKind === 'linuxdo' ? 'linuxdo'
    : mutationKind ? 'form' : null;
  const failureScope = submissionKind === 'linuxdo' ? 'oauth'
    : entry.view === 'login' ? 'login' : 'enrollment';
  const settleSubmission = (operation: Operation) => ({
    onSuccess: (result: AuthSubmissionResult) => accept(operation, result),
    onSettled: () => release(operation),
  });

  const forms: AccountFormsProps = {
    view: entry.view,
    initialEmail: entry.email,
    submission: {
      error: authFailureMessage(
        authorization instanceof Error ? authorization : submission.error,
        t,
        failureScope,
      ),
      isPending: authorization === 'pending' || submission.isPending,
      kind: submissionKind,
      resetCompletedEmail: submission.data?.kind === 'password-reset'
        ? submission.data.email
        : null,
    },
    emailCode: {
      error: authFailureMessage(emailCode.error, t, 'recovery'),
      isPending: emailCode.isPending,
      sentEmail: emailCode.isSuccess ? emailCode.variables?.input.email ?? null : null,
    },
    linuxDoAvailable: linuxDoLoginAvailable,
    onViewChange: (view, email) => {
      if (entryRef.current.view !== entry.view) return;
      cancel();
      reset();
      const next = { view, email: email ?? '' };
      entryRef.current = next;
      setEntry(next);
    },
    onSubmit: (input) => {
      if (entryRef.current.view !== entry.view || !matchesView(input, entry.view)) return;
      const operation = start();
      if (operation) submission.mutate(
        { signal: operation.controller.signal, submission: input },
        settleSubmission(operation),
      );
    },
    onSendCode: (input) => {
      if (entryRef.current.view !== entry.view || entry.view === 'login') return;
      const operation = start();
      if (operation) emailCode.mutate(
        { signal: operation.controller.signal, input },
        { onSettled: () => release(operation) },
      );
    },
    onBeginLinuxDo: () => {
      if (!linuxDoLoginAvailable || entryRef.current.view !== entry.view || entry.view !== 'login') return;
      const operation = start();
      if (!operation) return;
      setAuthorization('pending');
      void (async () => {
        const completion = await authorizeLinuxDo(operation.controller.signal, returnTo);
        if (operationRef.current !== operation) return;
        if (!completion) { setAuthorization(null); release(operation); return; }
        assertActive(operation.controller.signal);
        setAuthorization(null);
        submission.mutate({
          signal: operation.controller.signal,
          submission: { kind: 'linuxdo', ...completion.input, returnTo: completion.returnTo },
        }, settleSubmission(operation));
      })().catch((error: unknown) => {
        if (operationRef.current !== operation) return;
        setAuthorization(error instanceof Error ? error : new Error('Authorization failed'));
        release(operation);
      });
    },
    onClearFeedback: () => { if (!operationRef.current) reset(); },
  };

  return { session, forms };
}

type CallbackExchange = {
  signal: AbortSignal;
  promise: Promise<AuthSubmissionResult>;
};

export function useLinuxDoCallback() {
  const exchangeRef = useRef<CallbackExchange | null>(null);
  const submission = useAuthSubmission();
  const [destination, setDestination] = useState<PostLoginDestination | null>(null);
  const [callbackError, setCallbackError] = useState<Error | null>(null);
  const { t } = useTranslation('auth');
  const exchange = submission.mutateAsync;

  useEffect(() => {
    if (!exchangeRef.current) {
      const signal = requestScope();
      const promise = Promise.resolve().then(() => {
        assertActive(signal);
        const completion = consumeLinuxDoCallback();
        return exchange({
          signal,
          submission: { kind: 'linuxdo', ...completion.input, returnTo: completion.returnTo },
        });
      });
      exchangeRef.current = { signal, promise };
    }
    const current = exchangeRef.current;
    let active = true;
    void current.promise.then((result) => {
      if (!active || result.kind !== 'session') return;
      try {
        assertActive(current.signal);
        appStore.getState().setSession(result.session);
        setDestination(result.returnTo);
      } catch { /* A stale callback cannot update the current route or session. */ }
    }, (error: unknown) => {
      if (active && !current.signal.aborted) {
        setCallbackError(error instanceof Error ? error : new Error('Authorization failed'));
      }
    });
    return () => { active = false; };
  }, [exchange]);

  return { destination, error: authFailureMessage(callbackError ?? submission.error, t, 'oauth') };
}
