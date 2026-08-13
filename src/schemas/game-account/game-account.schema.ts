import * as v from 'valibot';

import {
  arkHostAvatarSchema,
  arkHostCaptchaInfoSchema,
  arkHostGameConfigSchema,
} from '@/schemas/arkhost';

export const gameAccountColorSchema = v.picklist(['primary', 'warning', 'muted']);

export const gameAccountSchema = v.object({
  account: v.pipe(v.string(), v.minLength(1)),
  ap: v.pipe(v.number(), v.integer(), v.minValue(0)),
  avatar: arkHostAvatarSchema,
  captchaInfo: arkHostCaptchaInfoSchema,
  color: gameAccountColorSchema,
  config: arkHostGameConfigSchema,
  createdAt: v.pipe(v.number(), v.integer(), v.minValue(0)),
  isVerified: v.boolean(),
  level: v.pipe(v.number(), v.integer(), v.minValue(0)),
  nickname: v.string(),
  platform: v.pipe(v.number(), v.integer()),
  statusCode: v.pipe(v.number(), v.integer()),
  statusText: v.string(),
  userId: v.pipe(v.string(), v.minLength(1)),
});

export type GameAccount = v.InferOutput<typeof gameAccountSchema>;
export type GameAccountColor = v.InferOutput<typeof gameAccountColorSchema>;
