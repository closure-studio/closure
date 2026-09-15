import * as v from 'valibot';
import { nonBlankStringSchema as text } from '@/schemas/primitives';
export const gameCaptchaSubmissionSchema = v.union([
  v.object({ challenge: text, geetest_challenge: text, geetest_validate: text, geetest_seccode: text }),
  v.object({ challenge: text, captcha_id: text, lot_number: text, pass_token: text, gen_time: text, captcha_output: text }),
]);
export type GameCaptchaSubmission = v.InferOutput<typeof gameCaptchaSubmissionSchema>;
export const gameCaptchaUpdateSchema = v.object({ account: text, captcha: gameCaptchaSubmissionSchema });
export type GameCaptchaUpdate = v.InferOutput<typeof gameCaptchaUpdateSchema>;
