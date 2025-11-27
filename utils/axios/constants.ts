import { ApiCallOptions } from "@/types/axios";

interface IIDServerConstants {
  LOGIN: ApiCallOptions;
}

interface IArkHostConstants {
  CONFIG: ApiCallOptions;
  GAME: ApiCallOptions;
}
interface IAssetsConstants {
  ITEMS: ApiCallOptions;
  STAGES: ApiCallOptions;
}

export const ID_SERVER_CONSTANTS: IIDServerConstants = {
  LOGIN: {
    endPoint: "/api/v1/login",
    method: "POST",
  },
} as const satisfies IIDServerConstants;

export const ARK_HOST_CONSTANTS: IArkHostConstants = {
  CONFIG: {
    endPoint: "/system/config",
    method: "GET",
    isPublic: true,
  },
  GAME: {
    endPoint: "/game",
    method: "GET",
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
