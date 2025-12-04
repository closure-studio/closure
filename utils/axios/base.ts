import { IServiceConfig, ApiCallOptions, IAPIResponse } from "@/types/axios";
import axios, { AxiosInstance } from "axios";
import { LOG } from "../logger/logger";

abstract class ServerBase {
  log = LOG.extend("AxiosBase");
  // axios instance
  private instance: AxiosInstance;
  private isTokenExpired?: () => boolean;
  private refreshToken?: () => Promise<void>;
  private isRefreshing = false;
  private failedQueue: {
    resolve: (token: string | null) => void;
    reject: (error: any) => void;
  }[] = [];

  constructor(config: IServiceConfig) {
    // Initialize the instance here (e.g., Axios instance)
    this.instance = axios.create({
      baseURL: config.HOST,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  public setTokenRefreshLogic(
    isTokenExpired: () => boolean,
    refreshToken: () => Promise<void>,
  ) {
    this.isTokenExpired = isTokenExpired;
    this.refreshToken = refreshToken;
  }

  private async checkAndRefreshToken() {
    if (this.isTokenExpired && this.refreshToken && this.isTokenExpired()) {
      await this.handleTokenRefresh();
    }
  }

  private async checkTokenIfNeeded(options?: ApiCallOptions) {
    if (options?.isPublic && options.isPublic === true) {
      return;
    }
    await this.checkAndRefreshToken();
  }

  // ...existing code...
  private async handleTokenRefresh(): Promise<string | null> {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const newToken = (await this.refreshToken?.()) ?? null;

      // Process all queued requests
      this.failedQueue.forEach(({ resolve }) => {
        resolve(newToken);
      });

      return newToken;
    } catch (error) {
      // Reject all queued requests
      this.failedQueue.forEach(({ reject }) => {
        reject(error);
      });
      return null;
    } finally {
      this.isRefreshing = false;
      this.failedQueue = [];
    }
  }

  // 抽象方法，子类必须实现
  protected abstract handleResponse<T>(
    promise: Promise<any>,
  ): Promise<IAPIResponse<T>>;

  // 通用POST方法
  protected async post<T>(
    url: string,
    options?: ApiCallOptions,
  ): Promise<IAPIResponse<T>> {
    await this.checkTokenIfNeeded(options);
    const { data, errorPrefix, ...axiosConfig } = options || {};

    const resp = await this.handleResponse<T>(
      this.getInstance().post(url, data, axiosConfig),
    );
    this.log.debug("POST Response:", resp);
    if (!resp.data) {
      this.log.error(`${errorPrefix || "POST Request"} failed:`, resp.message);
    }
    return resp;
  }

  // 通用GET方法
  protected async get<T>(
    url: string,
    options?: ApiCallOptions,
  ): Promise<IAPIResponse<T>> {
    await this.checkTokenIfNeeded(options);
    const { errorPrefix, ...axiosConfig } = options || {};

    const resp = await this.handleResponse<T>(
      this.getInstance().get(url, axiosConfig),
    );
    return resp;
  }

  // 通用PUT方法
  protected async put<T>(
    url: string,
    options?: ApiCallOptions,
  ): Promise<IAPIResponse<T>> {
    await this.checkTokenIfNeeded(options);
    const { data, errorPrefix, ...axiosConfig } = options || {};

    const resp = await this.handleResponse<T>(
      this.getInstance().put(url, data, axiosConfig),
    );
    this.log.debug("PUT Response:", resp);
    if (!resp.data) {
      this.log.error(`${errorPrefix || "PUT Request"} failed:`, resp.message);
    }
    return resp;
  }

  // 通用DELETE方法
  protected async delete<T>(
    url: string,
    options?: ApiCallOptions,
  ): Promise<IAPIResponse<T>> {
    await this.checkTokenIfNeeded(options);
    const { errorPrefix, ...axiosConfig } = options || {};

    const resp = await this.handleResponse<T>(
      this.getInstance().delete(url, axiosConfig),
    );
    this.log.debug("DELETE Response:", resp);
    if (!resp.data) {
      this.log.error(
        `${errorPrefix || "DELETE Request"} failed:`,
        resp.message,
      );
    }
    return resp;
  }

  /**
   * 更新 axios 实例的 baseURL
   * @param newHost 新的 host 地址
   */
  public setBaseURL(newHost: string) {
    this.log.info(`Updating baseURL to: ${newHost}`);
    this.instance.defaults.baseURL = newHost;
  }

  /**
   * 更新 axios 实例的 Authorization header
   * @param newToken 新的 token
   */
  public setAuthToken(newToken: string) {
    let authValue = `Bearer ${newToken}`;
    // only 1 bearer
    authValue = authValue.replace(/Bearer\s+Bearer\s+/i, "Bearer ");
    this.log.info("Updating Authorization token");
    this.instance.defaults.headers.common["Authorization"] = authValue;
  }

  /**
   * 移除 Authorization header
   */
  public removeAuthToken() {
    this.log.info("Removing Authorization token");
    delete this.instance.defaults.headers.common["Authorization"];
  }

  /**
   * 获取 axios 实例
   */
  public getInstance(): AxiosInstance {
    return this.instance;
  }
}

export default ServerBase;
