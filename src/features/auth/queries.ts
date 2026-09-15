import { useMutation } from '@tanstack/react-query';

import type {
  AuthFormSubmission,
  EmailCodeRequestInput,
  LinuxDoLoginInput,
  UserSession,
} from '@/schemas/auth';
import type { PasswordChangeInput } from '@/schemas/user-account';
import type { PostLoginDestination } from '@/routing/auth-routing';
import { requestScope } from '@/services/request-scope';
import { appStore } from '@/store';
import { FailureError, unwrapResult } from '@/utils/failure-error';
import { authApi, type AuthFailure } from './api';

type LinuxDoSubmission = {
  kind: 'linuxdo';
  returnTo: PostLoginDestination;
} & LinuxDoLoginInput;

type AuthSubmission = AuthFormSubmission | LinuxDoSubmission;
type AuthSubmissionVariables = {
  signal: AbortSignal;
  submission: AuthSubmission;
};
type EmailCodeVariables = {
  signal: AbortSignal;
  input: EmailCodeRequestInput;
};

export type AuthSubmissionResult =
  | { kind: 'password-reset'; email: string }
  | { kind: 'session'; returnTo: PostLoginDestination | null; session: UserSession };

export function useAuthSubmission() {
  return useMutation<AuthSubmissionResult, Error, AuthSubmissionVariables>({
    mutationKey: ['auth', 'submission'],
    mutationFn: async ({ signal, submission }) => {
      if (submission.kind === 'reset-password') {
        unwrapResult(await authApi.resetPassword({
          code: submission.code, email: submission.email, password: submission.password,
        }, signal));
        return { email: submission.email, kind: 'password-reset' };
      }

      let session: UserSession;
      let returnTo: PostLoginDestination | null = null;
      if (submission.kind === 'login') {
        session = unwrapResult(await authApi.login({
          identifier: submission.identifier, password: submission.password,
        }, signal));
      } else if (submission.kind === 'register') {
        session = unwrapResult(await authApi.register({
          code: submission.code, email: submission.email, password: submission.password,
        }, signal));
      } else {
        session = unwrapResult(await authApi.loginWithLinuxDo({
          code: submission.code, code_verifier: submission.code_verifier,
        }, signal));
        returnTo = submission.returnTo;
      }
      return { kind: 'session', returnTo, session };
    },
  });
}

export function useEmailCode() {
  return useMutation<void, Error, EmailCodeVariables>({
    mutationKey: ['auth', 'email-code'],
    mutationFn: async ({ signal, input }) => {
      unwrapResult(await authApi.requestEmailCode(input, signal));
    },
  });
}

export function useUpdatePassword() {
  return useMutation<boolean, AuthFailure, PasswordChangeInput>({
    mutationFn: async (input) => {
      const signal = requestScope();
      const state = appStore.getState();
      const session = state.auth.session;
      if (!session) throw new FailureError({ code: 'session-expired', kind: 'business' });
      unwrapResult(await authApi.updatePassword({
        accessToken: session.accessToken,
        currentPassword: input.currentPassword,
        email: session.principal.email,
        newPassword: input.newPassword,
      }, signal));
      return true;
    },
  });
}
