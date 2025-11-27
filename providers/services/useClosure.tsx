import { MESSAGES } from "@/constants/messages";
import { IAssetItems, IAssetStages } from "@/types/assets";
import { IAuthSession, IJWTPayload, ILoginResponse, UUID } from "@/types/auth";
import { IAPIResponse } from "@/types/axios";
import { LOG } from "@/utils/logger/logger";
import { jwtDecode } from "jwt-decode";
import React, { createContext, ReactNode, useContext } from "react";
import { useData } from "../data";

// UI -> dataProvider -> 业务逻辑 -> useAPI -> api
// 这里是业务逻辑层，负责整合多个 API 调用，提供给上层使用

/**
 * 全局数据 Context
 * 集成所有全局状态：认证、配置、设置等
 */
interface ClosureContextType {
  login: (session: IAuthSession) => Promise<IAPIResponse<ILoginResponse>>;
  logout: (uuid: UUID) => Promise<void>;
  // to do: should be wrapped in a single fetchAssets function
  fetchAssetItems: () => Promise<IAPIResponse<IAssetItems>>;
  fetchAssetStages: () => Promise<IAPIResponse<IAssetStages>>;
}

const ClosureContext = createContext<ClosureContextType | undefined>(undefined);

interface ClosureProviderProps {
  children: ReactNode;
}
const log = LOG.extend("ClosureProvider");

const ClosureProvider = ({ children }: ClosureProviderProps) => {
  const { apiClients, updateAppConfig } = useData();
  const { idServerClient, assetsClient } = apiClients;

  const login = async (session: IAuthSession) => {
    try {
      const { credential } = session;
      if (!credential) {
        return {
          code: 0,
          message: MESSAGES.AUTH.MISSING_CREDENTIALS,
        };
      }
      const { email, password } = credential;
      if (!email || !password) {
        return {
          code: 0,
          message: MESSAGES.AUTH.EMAIL_PASSWORD_REQUIRED,
        };
      }

      const response = await idServerClient.login(email, password);
      if (response.code !== 1) {
        return {
          code: 0,
          message: response.message || MESSAGES.AUTH.LOGIN_FAILED,
        };
      }

      if (!response.data) {
        log.error("Invalid response data");
        return {
          code: 0,
          message: MESSAGES.AUTH.INVALID_RESPONSE,
        };
      }
      log.info(MESSAGES.AUTH.LOGIN_SUCCESS, { email });
      log.debug("Login response data:", response.data);
      // decode token to get payload
      const payload = jwtDecode<IJWTPayload>(response.data.token);
      session.credential.token = response.data.token;
      session.payload = payload;
      // update response data to app config
      updateAppConfig((draft) => {
        draft.currentCredentialUUID = session.payload?.uuid || null;
        draft.credentialRecord[session.payload?.uuid || ""] = session;
      });

      return {
        code: 1,
        message: MESSAGES.AUTH.LOGIN_SUCCESS,
        data: response.data,
      };
    } catch (error) {
      LOG.error(MESSAGES.AUTH.LOGIN_FAILED, error);
      return {
        code: 0,
        message:
          error instanceof Error ? error.message : MESSAGES.AUTH.UNKNOWN_ERROR,
      };
    }
  };

  const logout = async (uuid: UUID): Promise<void> => {
    try {
      updateAppConfig((draft) => {
        draft.currentCredentialUUID = null;
        delete draft.credentialRecord[uuid];
      });
      LOG.info("Logout successful");
    } catch (error) {
      LOG.error("Logout failed", error);
      throw error;
    }
  };

  const fetchAssetItems = async (): Promise<IAPIResponse<IAssetItems>> => {
    try {
      const response = await assetsClient.getItems();
      if (response.code === 1 && response.data) {
        updateAppConfig((draft) => {
          draft.assetItems = response.data || {};
        });
        log.info("Asset items fetched successfully");
        return response;
      }
      log.error("Failed to fetch asset items:", response.message);
      return response;
    } catch (error) {
      log.error("Error fetching asset items:", error);
      return {
        code: 0,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  const fetchAssetStages = async (): Promise<IAPIResponse<IAssetStages>> => {
    try {
      const response = await assetsClient.getStages();
      if (response.code === 1 && response.data) {
        updateAppConfig((draft) => {
          draft.assetStages = response.data || {};
        });
        log.info("Asset stages fetched successfully");
        return response;
      }
      log.error("Failed to fetch asset stages:", response.message);
      return response;
    } catch (error) {
      log.error("Error fetching asset stages:", error);
      return {
        code: 0,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  const values: ClosureContextType = {
    login,
    logout,
    fetchAssetItems,
    fetchAssetStages,
  };

  return (
    <ClosureContext.Provider value={values}>{children}</ClosureContext.Provider>
  );
};

/**
 * 使用全局数据的 Hook
 */
const useClosure = (): ClosureContextType => {
  const context = useContext(ClosureContext);
  if (context === undefined) {
    throw new Error("useClosure must be used within a ClosureProvider");
  }
  return context;
};

export { ClosureProvider, useClosure };
