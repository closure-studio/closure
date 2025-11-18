import { DEFAULT_CONSTANTS } from '@/constants/constants';
import { IAuthCredentials, IAuthLoginResponse } from '@/types/auth';
import { IApiResponse } from '@/types/axios';
import { LOG } from '@/utils/logger/logger';
import IdServerClient from '../axios/idServer';

// 创建 ID Server 客户端实例
const idServerClient = new IdServerClient(DEFAULT_CONSTANTS.SERVICE_CONFIGS.ID_SERVER);

/**
 * 用户登录
 * @param credentials 登录凭证（邮箱和密码）
 * @returns 登录响应（包含 token）
 */
export async function login(credentials: IAuthCredentials): Promise<IAuthLoginResponse> {
  try {
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }

    const response: IApiResponse<IAuthLoginResponse> = await idServerClient.login(
      credentials.email,
      credentials.password
    );

    if (response.code !== 200 && response.code !== 0) {
      throw new Error(response.message || 'Login failed');
    }

    if (!response.data) {
      throw new Error('Invalid response from server');
    }

    LOG.info('Login successful', { email: credentials.email });
    return response.data;
  } catch (error) {
    LOG.error('Login failed', error);
    throw error;
  }
}

/**
 * 用户登出
 */
export async function logout(): Promise<void> {
  try {
    // 清除本地存储的 token
    // 如果需要调用服务器的登出接口，可以在这里添加
    LOG.info('Logout successful');
  } catch (error) {
    LOG.error('Logout failed', error);
    throw error;
  }
}
