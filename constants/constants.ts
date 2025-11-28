import { IAPPStates } from "@/types/storage";
import { IServiceConfigs } from "../types/axios.js";

const CLARITY_NATIVE_PROD_ID = "t0eiarz3dw";
const CLARITY_NATIVE_PREVIEW_ID = "syvx7716cr";

interface IConstants {
  CLARITY: {
    NATIVE_PREVIEW_ID: string;
    NATIVE_PROD_ID: string;
  };
  SERVICE_CONFIGS: IServiceConfigs;
  TOAST: {
    DURATION: number;
  };
  STORAGE_KEYS: {
    DEFAULT_STORAGE_KEY: string;
  };
}

export const CONSTANTS: IConstants = {
  CLARITY: {
    NATIVE_PREVIEW_ID: CLARITY_NATIVE_PREVIEW_ID,
    NATIVE_PROD_ID: CLARITY_NATIVE_PROD_ID,
  },
  SERVICE_CONFIGS: {
    ARK_HOST: {
      HOST: `https://api-tunnel.arknights.app`,
    },
    ARK_QUOTA: {
      HOST: `https://registry.ltsc.vip`,
    },
    ID_SERVER: {
      HOST: `https://passport.ltsc.vip`,
    },
    ASSETS_SERVER: {
      HOST: `https://closure.ltsc.vip`,
    },
  },
  TOAST: {
    DURATION: 1500,
  },
  STORAGE_KEYS: {
    DEFAULT_STORAGE_KEY: "default_mmkv_storage",
  },
} as const satisfies IConstants;

export const DEFAULT_APP_STATES: IAPPStates = {
  apiConfigs: {
    serviceConfigs: CONSTANTS.SERVICE_CONFIGS,
  },
  currentCredentialUUID: null,
  credentialRecord: {},
  assetItems: {},
  assetStages: {},
  gamesData: {},
};
