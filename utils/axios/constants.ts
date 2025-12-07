import { ApiCallOptions } from "@/types/axios";

interface IIDServerConstants {
  LOGIN: ApiCallOptions;
  REGISTER_CODE: ApiCallOptions;
  REGISTER: ApiCallOptions;
  FORGET_PASSWORD: ApiCallOptions;
}

interface IArkHostConstants {
  CONFIG: ApiCallOptions;
  GAME: ApiCallOptions;
  GAME_DETAIL: ApiCallOptions;
  GAME_LOG: ApiCallOptions;
  GAME_LOGIN: ApiCallOptions;
  GAME_CONFIG: ApiCallOptions;
}
interface IAssetsConstants {
  ITEMS: ApiCallOptions;
  STAGES: ApiCallOptions;
}

interface IArkQuotaConstants {
  DELETE_GAME: ApiCallOptions;
}

export const ID_SERVER_CONSTANTS: IIDServerConstants = {
  LOGIN: {
    endPoint: "/api/v1/login",
    method: "POST",
  },
  REGISTER_CODE: {
    endPoint: "/api/v1/mail/register/code",
    method: "POST",
  },
  REGISTER: {
    endPoint: "/api/v1/register",
    method: "POST",
  },
  FORGET_PASSWORD: {
    endPoint: "/api/v1/forget",
    method: "POST",
  },
} as const satisfies IIDServerConstants;

export const ARK_HOST_CONSTANTS: IArkHostConstants = {
  CONFIG: {
    endPoint: "/system/config",
    method: "GET",
  },
  GAME: {
    endPoint: "/game",
    method: "GET",
  },
  GAME_DETAIL: {
    endPoint: "/game",
    method: "GET",
  },
  GAME_LOG: {
    endPoint: "/game/log",
    method: "GET",
  },
  GAME_LOGIN: {
    endPoint: "/game/login",
    method: "POST",
  },
  GAME_CONFIG: {
    endPoint: "/game/config",
    method: "POST",
  },
} as const satisfies IArkHostConstants;

export const ASSETS_CONSTANTS: IAssetsConstants = {
  ITEMS: {
    endPoint: "/data/items.json",
    method: "GET",
    isPublic: true,
  },
  STAGES: {
    endPoint: "/data/stages.json",
    method: "GET",
    isPublic: true,
  },
} as const satisfies IAssetsConstants;

export const ARK_QUOTA_CONSTANTS: IArkQuotaConstants = {
  DELETE_GAME: {
    endPoint: "/api/slots/gameAccount",
    method: "POST",
  },
} as const satisfies IArkQuotaConstants;
