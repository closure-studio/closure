import * as v from 'valibot';

export const loginCredentialsSchema = v.object({
  email: v.pipe(v.string(), v.trim(), v.email()),
  password: v.pipe(v.string(), v.check((value) => value.trim().length > 0)),
});

export type LoginCredentials = v.InferOutput<typeof loginCredentialsSchema>;

export const loginSubmissionSchema = v.object({
  credentials: loginCredentialsSchema,
  rememberSession: v.boolean(),
});

export type LoginSubmission = v.InferOutput<typeof loginSubmissionSchema>;
