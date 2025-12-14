import { LOG } from "@/utils/logger/logger";
import {
  EventSourceMessage,
  fetchEventSource,
} from "@microsoft/fetch-event-source";

const log = LOG.extend("SSEClient");

/**
 * 通用 SSE 事件处理器
 */
export interface SSEEventHandlers {
  /**
   * 收到消息时的回调
   * @param eventType 事件类型
   * @param data 原始数据字符串
   */
  onMessage?: (eventType: string, data: string) => void;

  /**
   * 连接打开时的回调
   */
  onOpen?: () => void;

  /**
   * 连接关闭时的回调
   */
  onClose?: () => void;

  /**
   * 发生错误时的回调
   */
  onError?: (error: Error) => void;
}

/**
 * SSEClient - 通用 SSE 客户端
 *
 * 提供通用的 SSE 连接管理，不包含业务逻辑
 * 使用 @microsoft/fetch-event-source 替代原生 EventSource
 */
class SSEClient {
  private baseURL: string = "";
  private endpoint: string = "";
  private queryParams: Record<string, string> = {};
  private abortController: AbortController | null = null;
  private handlers: SSEEventHandlers = {};
  private isConnected: boolean = false;
  private connectionTimeout: number = 5000; // 5秒超时

  constructor(config?: { baseURL?: string; endpoint?: string }) {
    if (config?.baseURL) {
      this.baseURL = config.baseURL;
    }
    if (config?.endpoint) {
      this.endpoint = config.endpoint;
    }
  }

  /**
   * 设置 base URL
   */
  setBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
    log.debug("Base URL set to:", baseURL);
  }

  /**
   * 设置端点
   */
  setEndpoint(endpoint: string): void {
    this.endpoint = endpoint;
    log.debug("Endpoint set to:", endpoint);
  }

  /**
   * 设置查询参数
   */
  setQueryParams(params: Record<string, string>): void {
    this.queryParams = params;
    log.debug("Query params updated");
  }

  /**
   * 更新单个查询参数
   */
  updateQueryParam(key: string, value: string): void {
    this.queryParams[key] = value;
    log.debug("Query param updated:", key);
  }

  /**
   * 设置事件处理器
   */
  setEventHandlers(handlers: SSEEventHandlers): void {
    this.handlers = handlers;
  }

  /**
   * 获取连接状态
   */
  isConnectionActive(): boolean {
    return this.isConnected;
  }

  /**
   * 启动 SSE 连接
   */
  async start(): Promise<boolean> {
    if (!this.baseURL) {
      log.error("Base URL not set");
      this.handlers.onError?.(new Error("Base URL not set"));
      return false;
    }

    if (!this.endpoint) {
      log.error("Endpoint not set");
      this.handlers.onError?.(new Error("Endpoint not set"));
      return false;
    }

    if (this.isConnected) {
      log.warn("SSE connection already active");
      return true;
    }

    // 创建新的 AbortController
    this.abortController = new AbortController();

    // 构建查询字符串
    const queryString = Object.entries(this.queryParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");
    const url = `${this.baseURL}${this.endpoint}${queryString ? `?${queryString}` : ""}`;
    log.info("Starting SSE connection:", url);

    try {
      // 设置连接超时
      const timeoutId = setTimeout(() => {
        if (!this.isConnected) {
          log.error("Connection timeout");
          this.stop();
          this.handlers.onError?.(new Error("连接超时"));
        }
      }, this.connectionTimeout);

      await fetchEventSource(url, {
        signal: this.abortController.signal,

        onopen: async (response) => {
          clearTimeout(timeoutId);

          if (response.ok) {
            this.isConnected = true;
            log.info("SSE connection opened successfully");
            this.handlers.onOpen?.();
            return;
          }

          if (
            response.status >= 400 &&
            response.status < 500 &&
            response.status !== 429
          ) {
            // 客户端错误，不重试
            log.error("Client error:", response.status, response.statusText);
            this.handlers.onError?.(
              new Error(`Client error: ${response.status}`),
            );
            throw new Error(`Client error: ${response.status}`);
          } else {
            // 服务器错误或429，会自动重试
            log.warn(
              "Server error, will retry:",
              response.status,
              response.statusText,
            );
            throw new Error(`Server error: ${response.status}`);
          }
        },

        onmessage: (event: EventSourceMessage) => {
          this.handleMessage(event);
        },

        onerror: (error) => {
          log.error("SSE connection error:", error);
          this.isConnected = false;

          // 如果连接被主动关闭，不报错
          if (this.abortController?.signal.aborted) {
            return;
          }

          this.handlers.onError?.(
            error instanceof Error ? error : new Error(String(error)),
          );
          throw error; // 抛出错误以停止重连
        },

        onclose: () => {
          log.info("SSE connection closed");
          this.isConnected = false;
          this.handlers.onClose?.();
        },

        // 配置重连
        openWhenHidden: false, // 页面隐藏时不打开新连接
      });

      return true;
    } catch (error) {
      log.error("Failed to start SSE connection:", error);
      this.isConnected = false;
      this.handlers.onError?.(
        error instanceof Error ? error : new Error(String(error)),
      );
      return false;
    }
  }

  /**
   * 处理收到的消息（通用，不包含业务逻辑）
   */
  private handleMessage(event: EventSourceMessage): void {
    const { event: eventType, data } = event;

    if (!data) {
      return;
    }

    // 直接传递原始数据给处理器，由业务层决定如何处理
    log.debug("Received SSE event:", eventType, "data length:", data.length);
    this.handlers.onMessage?.(eventType, data);
  }

  /**
   * 停止 SSE 连接
   */
  stop(): void {
    if (this.abortController) {
      log.info("Stopping SSE connection");
      this.abortController.abort();
      this.abortController = null;
      this.isConnected = false;
    }
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.stop();
    this.handlers = {};
  }
}

export default SSEClient;
