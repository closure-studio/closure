import { useMutation } from '@tanstack/react-query';
import * as v from 'valibot';

import {
  loginSubmissionSchema,
  passwordRecoveryRequestInputSchema,
} from '@/schemas/auth';
import type {
  LoginSubmission,
  PasswordRecoveryRequestInput,
  UserSession,
} from '@/schemas/auth';
import type { PasswordChangeInput } from '@/schemas/user-account';
import { appStore } from '@/store';
import { FailureError, unwrapResult } from '@/utils/failure-error';
import { authApi, type AuthFailure } from './api';

function invalidInputFailure(): AuthFailure {
  return { code: 'invalid-input', kind: 'business' };
}

export function useLogin() {
  return useMutation<UserSession, AuthFailure, LoginSubmission>({
    mutationFn: async (submission) => {
      const parsedSubmission = v.safeParse(loginSubmissionSchema, submission);
      if (!parsedSubmission.success) throw new FailureError(invalidInputFailure());
      return unwrapResult(
        await authApi.login(parsedSubmission.output.credentials),
      );
    },
    onSuccess: (session) => {
      appStore.getState().setSession(session);
    },
  });
}

export function usePasswordRecovery() {
  return useMutation<undefined, AuthFailure, PasswordRecoveryRequestInput>({
    mutationFn: async (input) => {
      const parsedInput = v.safeParse(passwordRecoveryRequestInputSchema, input);
      if (!parsedInput.success) throw new FailureError(invalidInputFailure());
      unwrapResult(
        await authApi.requestPasswordRecovery(parsedInput.output),
      );
      return undefined;
    },
  });
}

export function useUpdatePassword() {
  return useMutation<boolean, AuthFailure, PasswordChangeInput>({
    mutationFn: async (input) => {
      const session = appStore.getState().auth.session;
      if (!session) {
        throw new FailureError({ code: 'session-expired', kind: 'business' });
      }
      const result = await authApi.updatePassword({
        accessToken: session.accessToken,
        currentPassword: input.currentPassword,
        email: session.principal.email,
        newPassword: input.newPassword,
      });
      unwrapResult(result);
      return true;
    },
  });
}
