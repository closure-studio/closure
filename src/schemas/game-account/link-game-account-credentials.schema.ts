import * as v from 'valibot';

import { serverChannelSchema } from './server-channel.schema';

export const linkGameAccountCredentialsSchema = v.object({
  accountIdentifier: v.pipe(v.string(), v.trim(), v.minLength(1)),
  password: v.pipe(v.string(), v.check((value) => value.trim().length > 0)),
  serverChannel: serverChannelSchema,
});

export type LinkGameAccountCredentials = v.InferOutput<typeof linkGameAccountCredentialsSchema>;
