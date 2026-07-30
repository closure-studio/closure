import * as v from 'valibot';

export const loginCredentialsSchema = v.object({
  password: v.pipe(v.string(), v.check((value) => value.trim().length > 0)),
  remember: v.boolean(),
  username: v.pipe(v.string(), v.trim(), v.minLength(1)),
});

export type LoginCredentials = v.InferOutput<typeof loginCredentialsSchema>;
