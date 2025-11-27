export interface IServiceConfigs {
  ARK_HOST: IServiceConfig;
  ARK_QUOTA: IServiceConfig;
  ID_SERVER: IServiceConfig;
  ASSETS_SERVER: IServiceConfig;
}

export interface IServiceConfig {
  HOST: string;
}

export interface ApiCallOptions {
  method: "GET" | "POST" | "PUT" | "DELETE";
  endPoint: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
  errorPrefix?: string;
  isPublic?: boolean; // 新增字段，true 表示公开，false 或未设置表示 private, 需要求 token
  [key: string]: any;
}

export interface IAPIResponse<T> {
  code: number;
  data?: T;
  message: string;
}

export interface AxiosClient {
  axiosInstance: any;
  updateHost: (newHost: string) => void;
  updateToken: (newToken: string) => void;
}
