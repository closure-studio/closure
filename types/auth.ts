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
