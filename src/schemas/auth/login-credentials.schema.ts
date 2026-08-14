import * as v from 'valibot';

export const loginCredentialsSchema = v.object({
  identifier: v.pipe(v.string(), v.trim(), v.check((value) => value.length > 0)),
  password: v.pipe(v.string(), v.check((value) => value.trim().length > 0)),
});

export type LoginCredentials = v.InferOutput<typeof loginCredentialsSchema>;

export const loginSubmissionSchema = v.object({
  credentials: loginCredentialsSchema,
});

export type LoginSubmission = v.InferOutput<typeof loginSubmissionSchema>;
