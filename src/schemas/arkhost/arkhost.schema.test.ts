import * as v from "valibot";

import {
  mockArkHostCharactersResponse,
  mockArkHostGameDetailResponse,
  mockArkHostGameListResponse,
  mockArkHostGameLogsResponse,
  mockArkHostSecondaryCharactersResponse,
  mockArkHostTertiaryCharactersResponse,
} from "@/mocks/arkhost";
import {
  arkHostCharactersResponseSchema,
  arkHostGameDetailResponseSchema,
  arkHostGameListResponseSchema,
  arkHostGameLogsResponseSchema,
} from ".";

describe("ArkHost server contracts", () => {
  it("accepts every supplied ArkHost response fixture", () => {
    expect(
      v.safeParse(arkHostGameListResponseSchema, mockArkHostGameListResponse)
        .success,
    ).toBe(true);
    expect(
      v.safeParse(
        arkHostGameDetailResponseSchema,
        mockArkHostGameDetailResponse,
      ).success,
    ).toBe(true);
    expect(
      v.safeParse(arkHostGameLogsResponseSchema, mockArkHostGameLogsResponse)
        .success,
    ).toBe(true);
    expect(
      v.safeParse(
        arkHostCharactersResponseSchema,
        mockArkHostCharactersResponse,
      ).success,
    ).toBe(true);
    expect(
      v.safeParse(
        arkHostCharactersResponseSchema,
        mockArkHostSecondaryCharactersResponse,
      ).success,
    ).toBe(true);
    expect(
      v.safeParse(
        arkHostCharactersResponseSchema,
        mockArkHostTertiaryCharactersResponse,
      ).success,
    ).toBe(true);
  });

  it("accepts the confirmed character envelope and rejects obsolete or incomplete shapes", () => {
    expect(
      v.safeParse(arkHostCharactersResponseSchema, {
        code: 1,
        data: { chars: [], total: 0 },
        message: "ok",
      }).success,
    ).toBe(true);
    expect(
      v.safeParse(arkHostCharactersResponseSchema, { G1: { chars: [] } })
        .success,
    ).toBe(false);
    expect(
      v.safeParse(arkHostCharactersResponseSchema, {
        code: 1,
        data: { chars: [{ charId: "char_3" }], total: 1 },
        message: "ok",
      }).success,
    ).toBe(false);
  });

  it("rejects malformed trust-boundary values", () => {
    expect(
      v.safeParse(arkHostGameListResponseSchema, {
        code: 1,
        data: [{ status: { ap: -1 } }],
        message: "ok",
      }).success,
    ).toBe(false);
    expect(
      v.safeParse(arkHostGameLogsResponseSchema, {
        code: 1,
        data: { hasMore: "yes", logs: [] },
        message: "ok",
      }).success,
    ).toBe(false);
  });
});
