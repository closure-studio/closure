import * as v from "valibot";

import { mockArkHostGameListResponse } from "@/mocks/arkhost";
import {
  gameAccountSchema,
  operatorSchema,
} from ".";

const firstEntry =
  mockArkHostGameListResponse.code === 1
    ? mockArkHostGameListResponse.data[0]
    : undefined;
if (!firstEntry) throw new Error("Expected ArkHost Game Account fixture.");
const gameAccount = {
  account: firstEntry.status.account,
  ap: firstEntry.status.ap,
  avatar: firstEntry.status.avatar,
  captchaInfo: firstEntry.captcha_info,
  color: "primary",
  config: firstEntry.game_config,
  createdAt: firstEntry.status.created_at,
  isVerified: firstEntry.status.is_verify,
  level: firstEntry.status.level,
  nickname: firstEntry.status.nick_name,
  platform: firstEntry.status.platform,
  statusCode: firstEntry.status.code,
  statusText: firstEntry.status.text,
  userId: firstEntry.status.uuid,
};

describe("Game Account schemas", () => {
  it("accepts a normalized ArkHost account and complete character progression", () => {
    expect(v.safeParse(gameAccountSchema, gameAccount).success).toBe(true);
    expect(
      v.safeParse(operatorSchema, {
        charId: "char_4017_puzzle",
        evolvePhase: 0,
        level: 1,
        potentialRank: 5,
      }).success,
    ).toBe(true);
  });
  it("rejects malformed account and character values", () => {
    expect(
      v.safeParse(gameAccountSchema, { ...gameAccount, color: "unknown" })
        .success,
    ).toBe(false);
    expect(v.safeParse(operatorSchema, { charId: "", level: -1 }).success).toBe(
      false,
    );
  });
});
