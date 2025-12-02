export type UUID = string;
export interface ILoginCredential {
  email?: string;
  password?: string;
  token?: string; // JWT token
}

export interface ILoginResponse {
  token: string; // JWT token
  available_slot: number; // deprecated
}

export type IRegisterCodeResponse = string; // 发送验证码的邮箱地址

export interface IRegisterRequest {
  email: string;
  password: string;
  code: string;
  noise: string;
  sign: string;
}

export type IRegisterResponse = boolean; // 注册响应，成功为 true，失败为 false

export interface IResetPasswordRequest {
  email: string;
  code: string;
  newPasswd: string;
}

export type IResetPasswordResponse = boolean; // 重置密码响应，成功为 true，失败为 false

export interface IJWTPayload {
  createdAt: number;
  email: string;
  exp: number;
  isAdmin: boolean;
  permission: number;
  status: number;
  uuid: UUID;
}

export interface IAuthSession {
  credential: ILoginCredential;
  payload?: IJWTPayload;
}
