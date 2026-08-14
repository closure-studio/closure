import { useMutation } from '@tanstack/react-query';
import * as v from 'valibot';

import { getQueryDependencies } from '@/services/query-dependencies';
import {
  loginSubmissionSchema,
  passwordRecoveryRequestInputSchema,
} from '@/schemas/auth';
import type {
  LoginSubmission,
  PasswordRecoveryRequestInput,
  UserSession,
} from '@/schemas/auth';
import { passwordChangeInputSchema } from '@/schemas/user-account';
import type { PasswordChangeInput } from '@/schemas/user-account';
import { appStore } from '@/store';
import { FailureError } from '@/utils/failure-error';
import type { AuthFailure } from './api';

function invalidInputFailure(): AuthFailure {
  return { code: 'invalid-input', kind: 'business' };
}

export function useLogin() {
  return useMutation<UserSession, AuthFailure, LoginSubmission>({
    mutationFn: async (submission) => {
      const parsedSubmission = v.safeParse(loginSubmissionSchema, submission);
      if (!parsedSubmission.success) throw new FailureError(invalidInputFailure());
      const result = await getQueryDependencies().authAdapter.login(
        parsedSubmission.output.credentials,
      );
      if (!result.ok) throw new FailureError(result.error);
      return result.data;
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
      const result = await getQueryDependencies().authAdapter.requestPasswordRecovery(
        parsedInput.output,
      );
      if (!result.ok) throw new FailureError(result.error);
      return undefined;
    },
  });
}

export function useUpdatePassword() {
  return useMutation<boolean, AuthFailure, PasswordChangeInput>({
    mutationFn: async (input) => {
      const parsedInput = v.safeParse(passwordChangeInputSchema, input);
      if (!parsedInput.success) throw new FailureError(invalidInputFailure());
      const session = appStore.getState().auth.session;
      if (!session) {
        throw new FailureError({ code: 'session-expired', kind: 'business' });
      }
      const result = await getQueryDependencies().authAdapter.updatePassword({
        accessToken: session.accessToken,
        currentPassword: parsedInput.output.currentPassword,
        email: session.principal.email,
        newPassword: parsedInput.output.newPassword,
      });
      if (!result.ok) throw new FailureError(result.error);
      return true;
    },
  });
}
