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
import { IAPIResponse } from "@/types/axios";
import { LOG } from "@/utils/logger/logger";
import { jwtDecode } from "jwt-decode";
import React, { createContext, ReactNode, useContext, useEffect } from "react";
import { useData } from "../data";
import { useSystem } from "../system";

// UI -> dataProvider -> 业务逻辑 -> useAPI -> api
// 这里是业务逻辑层，负责整合多个 API 调用，提供给上层使用

/**
 * 全局数据 Context
 * 集成所有全局状态：认证、配置、设置等
 */
interface ClosureContextType {
  login: (session: IAuthSession) => Promise<IAPIResponse<ILoginResponse>>;
  logout: (uuid: UUID) => Promise<void>;
  sendRegisterCode: (
    email: string,
  ) => Promise<IAPIResponse<IRegisterCodeResponse>>;
  register: (
    registerData: IRegisterRequest,
  ) => Promise<IAPIResponse<IRegisterResponse>>;
  resetPassword: (
    resetData: IResetPasswordRequest,
  ) => Promise<IAPIResponse<IResetPasswordResponse>>;
  // to do: should be wrapped in a single fetchAssets function
  fetchAssetItems: () => Promise<IAPIResponse<IAssetItems>>;
  fetchAssetStages: () => Promise<IAPIResponse<IAssetStages>>;
  fetchArkHostConfig: () => Promise<IAPIResponse<IArkHostConfig>>;
  fetchGameDetail: (gameId: string) => Promise<IAPIResponse<IGameDetail>>;
  fetchGameLogs: (
    gameId: string,
    page?: number,
  ) => Promise<IAPIResponse<IGameLogResponse>>;
  startGame: (
    gameId: string,
    recaptchaToken: string,
  ) => Promise<IAPIResponse<IGameLoginResponse>>;
  updateGameConfig: (
    gameId: string,
    config: Partial<IGameConfig>,
  ) => Promise<IAPIResponse<IUpdateGameConfigResponse>>;
  deleteGame: (
    gameUuid: string,
    recaptchaToken: string,
  ) => Promise<IAPIResponse<IDeleteGameResponse>>;
  createGame: (
    slotUuid: string,
    gameData: ICreateGameRequest,
    recaptchaToken: string,
  ) => Promise<IAPIResponse<ICreateGameResponse>>;
  fetchQuotaUser: () => Promise<IAPIResponse<IQuotaUser>>;
}

const ClosureContext = createContext<ClosureContextType | undefined>(undefined);

interface ClosureProviderProps {
  children: ReactNode;
}
const log = LOG.extend("ClosureProvider");

const ClosureProvider = ({ children }: ClosureProviderProps) => {
  const { toast } = useSystem();
  const { apiClients, updateAppStates, currentAuthSession } = useData();
  const {
    idServerClient,
    assetsClient,
    arkHostClient,
    arkQuotaClient,
    sseClient,
  } = apiClients;

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
          error instanceof Error ? error.message : MESSAGES.AUTH.UNKNOWN_ERROR,
      };
    }
  };

  const logout = async (uuid: UUID): Promise<void> => {
    try {
      updateAppStates((draft) => {
        draft.currentCredentialUUID = null;
        delete draft.credentialRecord[uuid];
      });
      LOG.info("Logout successful");
    } catch (error) {
      LOG.error("Logout failed", error);
      throw error;
    }
  };

  const sendRegisterCode = async (
    email: string,
  ): Promise<IAPIResponse<IRegisterCodeResponse>> => {
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
          error instanceof Error ? error.message : MESSAGES.AUTH.UNKNOWN_ERROR,
      };
    }
  };

  const register = async (
    registerData: IRegisterRequest,
  ): Promise<IAPIResponse<IRegisterResponse>> => {
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
          error instanceof Error ? error.message : MESSAGES.AUTH.UNKNOWN_ERROR,
      };
    }
  };

  const resetPassword = async (
    resetData: IResetPasswordRequest,
  ): Promise<IAPIResponse<IResetPasswordResponse>> => {
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
          error instanceof Error ? error.message : MESSAGES.AUTH.UNKNOWN_ERROR,
      };
    }
  };

  const fetchAssetItems = async (): Promise<IAPIResponse<IAssetItems>> => {
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
  };

  const fetchAssetStages = async (): Promise<IAPIResponse<IAssetStages>> => {
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
  };

  const fetchArkHostConfig = async (): Promise<
    IAPIResponse<IArkHostConfig>
  > => {
    try {
      const response = await arkHostClient.queryConfig();
      if (response.code === 1 && response.data) {
        log.info("Config data:", JSON.stringify(response.data, null, 2));
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
  };

  const fetchGameDetail = async (
    gameId: string,
  ): Promise<IAPIResponse<IGameDetail>> => {
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
  };

  const fetchGameLogs = async (
    gameId: string,
    page: number = 0,
  ): Promise<IAPIResponse<IGameLogResponse>> => {
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
  };

  const startGame = async (
    gameId: string,
    recaptchaToken: string,
  ): Promise<IAPIResponse<IGameLoginResponse>> => {
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

  const updateGameConfig = async (
    gameId: string,
    config: Partial<IGameConfig>,
  ): Promise<IAPIResponse<IUpdateGameConfigResponse>> => {
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
  };

  const deleteGame = async (
    gameUuid: string,
    recaptchaToken: string,
  ): Promise<IAPIResponse<IDeleteGameResponse>> => {
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
  };

  const createGame = async (
    slotUuid: string,
    gameData: ICreateGameRequest,
    recaptchaToken: string,
  ): Promise<IAPIResponse<ICreateGameResponse>> => {
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

      const response = await arkQuotaClient.createGame(
        slotUuid,
        gameData,
        recaptchaToken,
      );
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
  };

  const fetchQuotaUser = async (): Promise<IAPIResponse<IQuotaUser>> => {
    try {
      const response = await arkQuotaClient.getCurrentUser();

      // ArkQuota 返回的结构可能直接是用户对象，也可能在 data 中
      const user =
        (response as any)?.uuid !== undefined
          ? (response as unknown as IQuotaUser)
          : (response as any)?.data;

      if (user?.uuid) {
        const uuid = currentAuthSession?.payload?.uuid;
        if (uuid) {
          updateAppStates((draft) => {
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
        message: (response as any)?.message || "获取用户信息失败",
        data: user,
      };
    } catch (error) {
      log.error("Error fetching quota user:", error);
      return {
        code: 0,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  // 使用 SSE 实时获取游戏状态
  useEffect(() => {
    // 只有在用户已登录时才启动 SSE
    if (!currentAuthSession || !currentAuthSession.credential?.token) {
      return;
    }

    const uuid = currentAuthSession.payload?.uuid;
    if (!uuid) {
      return;
    }

    log.info("Starting SSE connection for real-time game updates");

    // 设置 SSE 事件处理器（业务逻辑）
    sseClient.setEventHandlers({
      onMessage: (eventType, data) => {
        try {
          // 根据事件类型处理不同的业务逻辑
          switch (eventType) {
            case "game": {
              const gameData = JSON.parse(data) as IGameData[];
              log.debug("SSE: Received game data:", gameData.length, "games");
              updateAppStates((draft) => {
                draft.gamesData[uuid] = gameData;
              });
              break;
            }

            case "log": {
              const logData = JSON.parse(data) as { content: string };
              log.debug("SSE: Received log:", logData.content);
              toast.success({
                text1: "日志",
                text2: logData.content,
              });
              break;
            }

            case "close": {
              log.warn("SSE: Server requested connection close");
              toast.warning({
                text1: "连接关闭",
                text2: "你已在其他窗口或设备访问，本页面暂停更新",
              });
              sseClient.stop();
              break;
            }

            case "ssr": {
              const ssrData = JSON.parse(data) ?? [];
              log.debug("SSE: Received SSR data:", ssrData.length, "items");
              // TODO: 处理 SSR 数据（6星抽卡通知）
              // 这里需要根据你的应用逻辑来处理 SSR 数据
              // 比如显示一个通知或对话框
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

      onOpen: () => {
        log.info("SSE: Connection opened");
      },

      onClose: () => {
        log.info("SSE: Connection closed by server");
      },

      onError: (error) => {
        log.error("SSE: Connection error:", error);
        // 不在这里显示错误提示，避免过于频繁的提示
        // 可以根据需要添加重连逻辑
      },
    });

    // 启动 SSE 连接
    const startConnection = async () => {
      const success = await sseClient.start();
      if (!success) {
        log.error("Failed to start SSE connection, falling back to polling");

        // SSE 连接失败，回退到轮询模式
        const queryGamesStatus = async () => {
          try {
            const response = await arkHostClient.queryGamesStatus();
            if (response.code === 1 && response.data) {
              updateAppStates((draft) => {
                draft.gamesData[uuid] = response.data || [];
              });
            }
          } catch (error) {
            log.error("Error querying games status:", error);
          }
        };

        // 立即执行一次
        queryGamesStatus();

        // 设置定时器，每3秒执行一次
        const intervalId = setInterval(queryGamesStatus, 3000);

        // 返回清理函数
        return () => {
          log.info("Stopping games status polling");
          clearInterval(intervalId);
        };
      }
    };

    startConnection();

    // 清理函数：组件卸载或依赖变化时停止 SSE 连接
    return () => {
      log.info("Stopping SSE connection");
      sseClient.stop();
    };
  }, [currentAuthSession, arkHostClient, sseClient, updateAppStates, toast]);

  const values: ClosureContextType = {
    login,
    logout,
    sendRegisterCode,
    register,
    resetPassword,
    fetchAssetItems,
    fetchAssetStages,
    fetchArkHostConfig,
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
