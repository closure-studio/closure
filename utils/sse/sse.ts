import { LOG } from "@/utils/logger/logger";
import EventSource, {
  ErrorEvent,
  EventSourceListener,
  ExceptionEvent,
  MessageEvent,
  OpenEvent,
  TimeoutEvent,
} from "react-native-sse";

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
 * 使用 react-native-sse 库实现
 */
class SSEClient {
  private baseURL: string = "";
  private endpoint: string = "";
  private queryParams: Record<string, string> = {};
  private handlers: SSEEventHandlers = {};
  private isConnected: boolean = false;
  private connectionTimeout: number = 5000; // 5秒超时
  private eventSource: EventSource<string> | null = null;
  private registeredEvents: Set<string> = new Set();

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
   * 注册自定义事件监听器
   * 允许业务层动态注册需要监听的事件类型
   * @param eventType 事件类型名称
   */
  registerEventListener(eventType: string): void {
    if (!this.eventSource) {
      log.warn(
        `Cannot register event listener for "${eventType}": SSE connection not started`
      );
      return;
    }

    if (this.registeredEvents.has(eventType)) {
      log.debug(`Event listener for "${eventType}" already registered`);
      return;
    }

    // 标准事件类型不需要注册（open, message, error）
    if (
      eventType === "open" ||
      eventType === "message" ||
      eventType === "error"
    ) {
      log.debug(
        `Event "${eventType}" is a standard event, no need to register`
      );
      return;
    }

    const customEventListener: EventSourceListener<string, string> = (
      event: any
    ) => {
      if (event.data) {
        this.handleMessage({
          event: eventType,
          data: event.data,
        });
      }
    };

    this.eventSource.addEventListener(eventType, customEventListener);
    this.registeredEvents.add(eventType);
    log.debug(`Registered custom event listener for: "${eventType}"`);
  }

  /**
   * 批量注册自定义事件监听器
   * @param eventTypes 事件类型数组
   */
  registerEventListeners(eventTypes: string[]): void {
    eventTypes.forEach((eventType) => {
      this.registerEventListener(eventType);
    });
  }

  /**
   * 获取连接状态
   */
  isConnectionActive(): boolean {
    return this.isConnected;
  }

  /**
   * 检查 baseURL 是否已设置
   */
  hasBaseURL(): boolean {
    return !!this.baseURL;
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

    // 如果已经连接，先关闭旧连接
    if (this.isConnected || this.eventSource) {
      log.warn(
        "SSE connection already active, closing existing connection first"
      );
      this.stop();
    }

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

      // 使用 react-native-sse
      // 设置 lineEndingCharacter 为 \n（标准 SSE 格式）
      this.eventSource = new EventSource<string>(url, {
        lineEndingCharacter: "\n",
      });

      clearTimeout(timeoutId);

      // 监听 open 事件
      const openListener: EventSourceListener<string, "open"> = (
        event: OpenEvent
      ) => {
        this.isConnected = true;
        log.info("SSE connection opened successfully");
        // 连接建立后，触发 onOpen 回调
        // 业务层可以在此回调中注册自定义事件监听器
        this.handlers.onOpen?.();
      };

      // 监听 message 事件（通用消息事件）
      const messageListener: EventSourceListener<string, "message"> = (
        event: MessageEvent
      ) => {
        if (event.data) {
          this.handleMessage({
            event: "message",
            data: event.data,
          });
        }
      };

      // 监听 error 事件
      const errorListener: EventSourceListener<string, "error"> = (
        event: ErrorEvent | TimeoutEvent | ExceptionEvent
      ) => {
        if (event.type === "error") {
          log.error("SSE connection error:", event.message);
          this.isConnected = false;
          this.handlers.onError?.(new Error(event.message));
        } else if (event.type === "timeout") {
          log.error("SSE connection timeout");
          this.isConnected = false;
          this.handlers.onError?.(new Error("Connection timeout"));
        } else if (event.type === "exception") {
          log.error("SSE exception:", event.message, event.error);
          this.isConnected = false;
          this.handlers.onError?.(event.error);
        }
      };

      // 注册标准事件监听器
      this.eventSource.addEventListener("open", openListener);
      this.eventSource.addEventListener("message", messageListener);
      this.eventSource.addEventListener("error", errorListener);

      return true;
    } catch (error) {
      log.error("Failed to start SSE connection:", error);
      this.isConnected = false;
      this.handlers.onError?.(
        error instanceof Error ? error : new Error(String(error))
      );
      return false;
    }
  }

  /**
   * 处理收到的消息（通用，不包含业务逻辑）
   */
  private handleMessage(event: { event?: string; data?: string }): void {
    const eventType = event.event || "message";
    const data = event.data;

    if (!data) {
      return;
    }

    // 直接传递原始数据给处理器，由业务层决定如何处理
    this.handlers.onMessage?.(eventType, data);
  }

  /**
   * 停止 SSE 连接
   */
  stop(): void {
    if (this.eventSource) {
      log.info("Stopping SSE connection");
      this.eventSource.removeAllEventListeners();
      this.eventSource.close();
      this.eventSource = null;
      this.isConnected = false;
      this.registeredEvents.clear();
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
