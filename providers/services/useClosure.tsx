import { MESSAGES } from "@/constants/messages";
import {
  IArkHostConfig,
  ICreateGameRequest,
  ICreateGameResponse,
  IDeleteGameResponse,
  IGameConfig,
  IGameData,
  IGameDetail,
  IGameLoginResponse,
  IGameLogResponse,
  IUpdateGameConfigResponse,
} from "@/types/arkHost";
import { IQuotaUser } from "@/types/arkQuota";
import { IAssetItems, IAssetStages } from "@/types/assets";
import {
  IAuthSession,
  IJWTPayload,
  ILoginResponse,
  IRegisterCodeResponse,
  IRegisterRequest,
  IRegisterResponse,
  IResetPasswordRequest,
  IResetPasswordResponse,
  UUID,
} from "@/types/auth";
import { IAPIResp } from "@/types/axios";
import { LOG } from "@/utils/logger/logger";
import { jwtDecode } from "jwt-decode";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useData } from "../data";
import { useSystem } from "../system";

// UI -> dataProvider -> 业务逻辑 -> useAPI -> api
// 这里是业务逻辑层，负责整合多个 API 调用，提供给上层使用

/**
 * 全局数据 Context
 * 集成所有全局状态：认证、配置、设置等
 */
interface ClosureContextType {
  login: (session: IAuthSession) => Promise<IAPIResp<ILoginResponse>>;
  logout: (uuid: UUID) => Promise<void>;
  sendRegisterCode: (email: string) => Promise<IAPIResp<IRegisterCodeResponse>>;
  register: (
    registerData: IRegisterRequest,
  ) => Promise<IAPIResp<IRegisterResponse>>;
  resetPassword: (
    resetData: IResetPasswordRequest,
  ) => Promise<IAPIResp<IResetPasswordResponse>>;
  // to do: should be wrapped in a single fetchAssets function
  fetchAssetItems: () => Promise<IAPIResp<IAssetItems>>;
  fetchAssetStages: () => Promise<IAPIResp<IAssetStages>>;
  fetchArkHostConfig: () => Promise<IAPIResp<IArkHostConfig>>;
  fetchGamesStatus: () => Promise<IAPIResp<IGameData[]>>;
  fetchGameDetail: (gameId: string) => Promise<IAPIResp<IGameDetail>>;
  fetchGameLogs: (
    gameId: string,
    page?: number,
  ) => Promise<IAPIResp<IGameLogResponse>>;
  startGame: (
    gameId: string,
    recaptchaToken: string,
  ) => Promise<IAPIResp<IGameLoginResponse>>;
  updateGameConfig: (
    gameId: string,
    config: Partial<IGameConfig>,
  ) => Promise<IAPIResp<IUpdateGameConfigResponse>>;
  deleteGame: (
    gameUuid: string,
    recaptchaToken: string,
  ) => Promise<IAPIResp<IDeleteGameResponse>>;
  createGame: (
    slotUuid: string,
    gameData: ICreateGameRequest,
    recaptchaToken: string,
  ) => Promise<IAPIResp<ICreateGameResponse>>;
  fetchQuotaUser: () => Promise<IAPIResp<IQuotaUser>>;
}

const ClosureContext = createContext<ClosureContextType | undefined>(undefined);

interface ClosureProviderProps {
  children: ReactNode;
}
const log = LOG.extend("ClosureProvider");

const ClosureProvider = ({ children }: ClosureProviderProps) => {
  const { toast } = useSystem();
  const { apiClients, updateAppStates, currentAuthSession, appStates } =
    useData();
  const {
    idServerClient,
    assetsClient,
    arkHostClient,
    arkQuotaClient,
    sseClient,
  } = apiClients;
  // 使用 ref 跟踪连接状态，避免重复连接
  const connectionStartedRef = useRef(false);

  const login = useCallback(
    async (session: IAuthSession) => {
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
        // update response data to app states
        updateAppStates((draft) => {
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
            error instanceof Error
              ? error.message
              : MESSAGES.AUTH.UNKNOWN_ERROR,
        };
      }
    },
    [idServerClient, updateAppStates],
  );

  const stopSSE = useCallback(() => {
    log.info("Stopping SSE connection");
    connectionStartedRef.current = false;
    sseClient.stop();
  }, [sseClient]);

  const logout = useCallback(
    async (uuid: UUID): Promise<void> => {
      try {
        stopSSE();
        updateAppStates((draft) => {
          draft.currentCredentialUUID = null;
          delete draft.credentialRecord[uuid];
          delete draft.quotaUsers[uuid];
          delete draft.gamesData[uuid];
        });
        LOG.info("Logout successful");
      } catch (error) {
        LOG.error("Logout failed", error);
        throw error;
      }
    },
    [updateAppStates, stopSSE],
  );

  const sendRegisterCode = useCallback(
    async (email: string): Promise<IAPIResp<IRegisterCodeResponse>> => {
      try {
        if (!email) {
          return {
            code: 0,
            message: MESSAGES.AUTH.EMAIL_PASSWORD_REQUIRED,
          };
        }

        const response = await idServerClient.sendRegisterCode(email);
        if (response.code === 1) {
          log.info("Register code sent successfully", { email });
          return response;
        }
        log.error("Failed to send register code:", response.message);
        return response;
      } catch (error) {
        LOG.error("Error sending register code:", error);
        return {
          code: 0,
          message:
            error instanceof Error
              ? error.message
              : MESSAGES.AUTH.UNKNOWN_ERROR,
        };
      }
    },
    [idServerClient],
  );

  const register = useCallback(
    async (
      registerData: IRegisterRequest,
    ): Promise<IAPIResp<IRegisterResponse>> => {
      try {
        const response = await idServerClient.register(registerData);
        if (response.code === 1) {
          log.info("Register successful", { registerData });
          return response;
        }
        log.error("Failed to register:", response.message);
        return response;
      } catch (error) {
        LOG.error("Error registering:", error);
        return {
          code: 0,
          message:
            error instanceof Error
              ? error.message
              : MESSAGES.AUTH.UNKNOWN_ERROR,
        };
      }
    },
    [idServerClient],
  );

  const resetPassword = useCallback(
    async (
      resetData: IResetPasswordRequest,
    ): Promise<IAPIResp<IResetPasswordResponse>> => {
      try {
        if (!resetData.email || !resetData.code || !resetData.newPasswd) {
          return {
            code: 0,
            message: "邮箱、验证码和新密码不能为空",
          };
        }

        const response = await idServerClient.resetPassword(resetData);
        if (response.code === 1) {
          log.info("Reset password successful", { email: resetData.email });
          return response;
        }
        log.error("Failed to reset password:", response.message);
        return response;
      } catch (error) {
        LOG.error("Error resetting password:", error);
        return {
          code: 0,
          message:
            error instanceof Error
              ? error.message
              : MESSAGES.AUTH.UNKNOWN_ERROR,
        };
      }
    },
    [idServerClient],
  );

  const fetchAssetItems = useCallback(async (): Promise<
    IAPIResp<IAssetItems>
  > => {
    try {
      const response = await assetsClient.getItems();
      if (response.code === 1 && response.data) {
        updateAppStates((draft) => {
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
  }, [assetsClient, updateAppStates]);

  const fetchAssetStages = useCallback(async (): Promise<
    IAPIResp<IAssetStages>
  > => {
    try {
      const response = await assetsClient.getStages();
      if (response.code === 1 && response.data) {
        updateAppStates((draft) => {
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
  }, [assetsClient, updateAppStates]);

  const fetchArkHostConfig = useCallback(async (): Promise<
    IAPIResp<IArkHostConfig>
  > => {
    try {
      const response = await arkHostClient.queryConfig();
      if (response.code === 1 && response.data) {
        updateAppStates((draft) => {
          draft.arkHostConfig = response.data || null;
        });
        return response;
      }
      log.error("Failed to fetch system config:", response.message);
      return response;
    } catch (error) {
      log.error("Error fetching system config:", error);
      return {
        code: 0,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }, [arkHostClient, updateAppStates]);

  const fetchGameDetail = useCallback(
    async (gameId: string): Promise<IAPIResp<IGameDetail>> => {
      try {
        const response = await arkHostClient.queryGameDetail(gameId);
        if (response.code === 1 && response.data) {
          const uuid = currentAuthSession?.payload?.uuid;
          if (uuid) {
            updateAppStates((draft) => {
              const games = draft.gamesData[uuid] || [];
              const gameIndex = games.findIndex(
                (game) => game.status.account === gameId,
              );
              if (gameIndex !== -1) {
                games[gameIndex].detail = response.data;
              }
            });
          }
          log.info("Game detail fetched successfully", { gameId });
          return response;
        }
        log.error("Failed to fetch game detail:", response.message);
        return response;
      } catch (error) {
        log.error("Error fetching game detail:", error);
        return {
          code: 0,
          message: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    [arkHostClient, currentAuthSession, updateAppStates],
  );

  const fetchGameLogs = useCallback(
    async (
      gameId: string,
      page: number = 0,
    ): Promise<IAPIResp<IGameLogResponse>> => {
      const MAX_LOGS = 1000;
      try {
        const response = await arkHostClient.queryGameLogs(gameId, page);
        if (response.code === 1 && response.data) {
          const uuid = currentAuthSession?.payload?.uuid;
          if (uuid) {
            // 使用 Immer produce 进行批量更新，无论有多少条 log，
            // 都只会触发一次状态更新和一次 storage 写入
            updateAppStates((draft) => {
              const games = draft.gamesData[uuid] || [];
              const gameIndex = games.findIndex(
                (game) => game.status.account === gameId,
              );
              if (gameIndex !== -1) {
                const existingLogs = games[gameIndex].logs?.logs || [];
                const newLogs = response.data?.logs || [];
                // 合并日志：page 0 时替换，否则追加
                const mergedLogs =
                  page === 0 ? newLogs : [...existingLogs, ...newLogs];
                // 限制最多保存 1000 条记录
                const limitedLogs = mergedLogs.slice(0, MAX_LOGS);
                games[gameIndex].logs = {
                  logs: limitedLogs,
                  hasMore: response.data?.hasMore ?? false,
                };
              }
            });
          }
          log.info("Game logs fetched successfully", { gameId, page });
          return response;
        }
        log.error("Failed to fetch game logs:", response.message);
        return response;
      } catch (error) {
        log.error("Error fetching game logs:", error);
        return {
          code: 0,
          message: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    [arkHostClient, currentAuthSession, updateAppStates],
  );

  const startGame = async (
    gameId: string,
    recaptchaToken: string,
  ): Promise<IAPIResp<IGameLoginResponse>> => {
    try {
      if (!gameId || !recaptchaToken) {
        return {
          code: 0,
          message: "游戏ID和reCAPTCHA token不能为空",
        };
      }

      const response = await arkHostClient.gameLogin(gameId, recaptchaToken);
      if (response.code === 1) {
        log.info("Game started successfully", { gameId });
        return response;
      }
      log.error("Failed to start game:", response.message);
      return response;
    } catch (error) {
      log.error("Error starting game:", error);
      return {
        code: 0,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  const updateGameConfig = useCallback(
    async (
      gameId: string,
      config: Partial<IGameConfig>,
    ): Promise<IAPIResp<IUpdateGameConfigResponse>> => {
      try {
        if (!gameId) {
          return {
            code: 0,
            message: "游戏ID不能为空",
          };
        }

        const response = await arkHostClient.updateGameConfig(gameId, config);
        if (response.code === 1) {
          log.info("Game config updated successfully", { gameId, config });
          return response;
        }
        log.error("Failed to update game config:", response.message);
        return response;
      } catch (error) {
        log.error("Error updating game config:", error);
        return {
          code: 0,
          message: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    [arkHostClient],
  );

  const deleteGame = useCallback(
    async (
      gameUuid: string,
      recaptchaToken: string,
    ): Promise<IAPIResp<IDeleteGameResponse>> => {
      try {
        if (!gameUuid || !recaptchaToken) {
          return {
            code: 0,
            message: "游戏UUID和reCAPTCHA token不能为空",
          };
        }

        const response = await arkQuotaClient.deleteGame(
          gameUuid,
          recaptchaToken,
        );
        // ArkQuota API 返回 { available: true } 表示成功
        if (response.data?.available) {
          log.info("Game deleted successfully", { gameUuid });
          return {
            code: 1,
            message: "删除成功",
            data: response.data,
          };
        }
        log.error("Failed to delete game:", response.message);
        return {
          code: 0,
          message: response.message || "删除失败",
          data: response.data,
        };
      } catch (error) {
        log.error("Error deleting game:", error);
        return {
          code: 0,
          message: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    [arkQuotaClient],
  );

  const createGame = useCallback(
    async (
      slotUuid: string,
      gameData: ICreateGameRequest,
      recaptchaToken: string,
    ): Promise<IAPIResp<ICreateGameResponse>> => {
      try {
        if (!slotUuid || !recaptchaToken) {
          return {
            code: 0,
            message: "槽位UUID和reCAPTCHA token不能为空",
          };
        }

        if (!gameData.account || !gameData.password) {
          return {
            code: 0,
            message: "账号和密码不能为空",
          };
        }
        console.log("createGame", slotUuid, gameData, recaptchaToken);
        const response = await arkQuotaClient.createGame(
          slotUuid,
          gameData,
          recaptchaToken,
        );
        console.log("createGame response", response);
        // ArkQuota API 返回 { available: true } 表示成功
        if (response.data?.available) {
          log.info("Game created successfully", {
            slotUuid,
            account: gameData.account,
          });
          return {
            code: 1,
            message: "创建成功",
            data: response.data,
          };
        }
        log.error("Failed to create game:", response.message);
        return {
          code: 0,
          message: response.message || "创建失败",
          data: response.data,
        };
      } catch (error) {
        log.error("Error creating game:", error);
        return {
          code: 0,
          message: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    [arkQuotaClient],
  );

  const fetchQuotaUser = useCallback(async (): Promise<
    IAPIResp<IQuotaUser>
  > => {
    try {
      const response = await arkQuotaClient.getCurrentUser();
      const user = response.data;
      if (user?.uuid) {
        const uuid = currentAuthSession?.payload?.uuid;
        if (uuid) {
          updateAppStates((draft) => {
            if (!draft.quotaUsers) {
              draft.quotaUsers = {};
            }
            draft.quotaUsers[uuid] = user;
          });
        }
        return {
          code: 1,
          message: "获取用户信息成功",
          data: user,
        };
      }

      return {
        code: 0,
        message: response.message || "获取用户信息失败",
        data: user,
      };
    } catch (error) {
      log.error("Error fetching quota user:", error);
      return {
        code: 0,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }, [arkQuotaClient, currentAuthSession, updateAppStates]);

  const fetchGamesStatus = useCallback(async (): Promise<
    IAPIResp<IGameData[]>
  > => {
    try {
      if (!currentAuthSession || !currentAuthSession.payload?.uuid) {
        return {
          code: 0,
          message: "用户未登录",
          data: [],
        };
      }
      const uuid = currentAuthSession.payload.uuid;
      const response = await arkHostClient.queryGamesStatus();
      if (response.code === 1 && response.data) {
        updateAppStates((draft) => {
          if (!draft.gamesData) {
            draft.gamesData = {};
          }
          draft.gamesData[uuid] = response.data || [];
        });
        return response;
      }
      log.error("Failed to fetch games status:", response.message);
      return response;
    } catch (error) {
      log.error("Error fetching games status:", error);
      return {
        code: 0,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }, [arkHostClient, currentAuthSession, updateAppStates]);

  const handleSSEMessage = useCallback(
    (eventType: string, data: string) => {
      const uuid = currentAuthSession?.payload?.uuid;
      if (!uuid) {
        return;
      }
      log.debug("SSE: Received message:", { eventType, data });
      try {
        switch (eventType) {
          case "game": {
            const gameData = JSON.parse(data) as IGameData[] | null;
            if (!gameData || !Array.isArray(gameData)) {
              break;
            }
            updateAppStates((draft) => {
              draft.gamesData[uuid] = gameData;
            });
            break;
          }
          case "log": {
            const logData = JSON.parse(data) as { content: string } | null;
            if (!logData || !logData.content) {
              break;
            }
            toast.success({
              text1: "日志",
              text2: logData.content,
            });
            break;
          }
          case "close": {
            toast.warning({
              text1: "连接关闭",
              text2: "你已在其他窗口或设备访问，本页面暂停更新",
            });
            stopSSE();
            break;
          }
          case "ssr": {
            const parsedData = JSON.parse(data);
            const ssrData = Array.isArray(parsedData) ? parsedData : [];
            if (ssrData.length > 0) {
              toast.info({
                text1: "SSR 通知",
                text2: "可露希尔又双叒叕抽到 6 星干员啦!!!",
              });
            }
            break;
          }
          default:
            log.debug("SSE: Received unknown event type:", eventType);
            break;
        }
      } catch (error) {
        log.error("SSE: Error parsing message:", error);
      }
    },
    [currentAuthSession, stopSSE, toast, updateAppStates],
  );

  const handleSSEOpen = useCallback(() => {
    log.info("SSE: Connection opened");
    const businessEvents = ["game", "log", "close", "ssr"];
    sseClient.registerEventListeners(businessEvents);
  }, [sseClient]);

  const handleSSEClose = useCallback(() => {
    log.info("SSE: Connection closed by server");
    connectionStartedRef.current = false;
  }, []);

  const handleSSEError = useCallback((error: unknown) => {
    log.error("SSE: Connection error:", error);
    connectionStartedRef.current = false;
  }, []);

  const startSSE = useCallback(async () => {
    // 只有在用户已登录时才启动 SSE
    if (!currentAuthSession || !currentAuthSession.credential?.token) {
      stopSSE();
      return;
    }

    const uuid = currentAuthSession.payload?.uuid;
    if (!uuid) {
      return;
    }

    // 检查 baseURL 是否已设置
    const baseURL = appStates.apiConfigs.serviceConfigs.ARK_HOST.HOST;
    if (!baseURL || !sseClient.hasBaseURL()) {
      log.warn("SSE baseURL not set yet, skipping connection");
      return;
    }

    // 确保只有一个全局 SSE 连接
    if (connectionStartedRef.current || sseClient.isConnectionActive()) {
      log.debug("SSE connection already active, skipping");
      return;
    }

    sseClient.setEventHandlers({
      onMessage: handleSSEMessage,
      onOpen: handleSSEOpen,
      onClose: handleSSEClose,
      onError: handleSSEError,
    });

    const success = await sseClient.start();
    if (!success) {
      log.error("Failed to start SSE connection");
      connectionStartedRef.current = false;
      return;
    }

    log.info("Starting SSE connection for real-time game updates");
    connectionStartedRef.current = true;
    // 连接建立后注册业务事件
    const businessEvents = ["game", "log", "close", "ssr"];
    sseClient.registerEventListeners(businessEvents);
  }, [
    appStates.apiConfigs.serviceConfigs.ARK_HOST.HOST,
    currentAuthSession,
    handleSSEClose,
    handleSSEError,
    handleSSEMessage,
    handleSSEOpen,
    sseClient,
    stopSSE,
  ]);

  useEffect(() => {
    return () => {
      stopSSE();
    };
  }, [stopSSE]);

  // 业务初始化：Provider 挂载后立即根据已有会话同步用户信息
  useEffect(() => {
    const initializeBusinessLogic = async () => {
      log.info("Initializing business logic");
      await fetchQuotaUser();
      await fetchGamesStatus();
      await startSSE();
    };
    if (!currentAuthSession) {
      return;
    }
    initializeBusinessLogic();
  }, [currentAuthSession, fetchQuotaUser, fetchGamesStatus, startSSE]);

  const values: ClosureContextType = {
    login,
    logout,
    sendRegisterCode,
    register,
    resetPassword,
    fetchAssetItems,
    fetchAssetStages,
    fetchArkHostConfig,
    fetchGamesStatus,
    fetchGameDetail,
    fetchGameLogs,
    startGame,
    updateGameConfig,
    deleteGame,
    createGame,
    fetchQuotaUser,
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
