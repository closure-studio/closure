import { IAuthSession, IJWTPayload, ILoginResponse, UUID } from '@/types/auth';
import { IAPIResponse } from '@/types/axios';
import { LOG } from '@/utils/logger/logger';
import { jwtDecode } from 'jwt-decode';
import React, { createContext, ReactNode, useContext } from 'react';
import { useData } from '../data';

// UI -> dataProvider -> 业务逻辑 -> useAPI -> api
// 这里是业务逻辑层，负责整合多个 API 调用，提供给上层使用

/**
 * 全局数据 Context
 * 集成所有全局状态：认证、配置、设置等
 */
interface ClosureContextType {
  login: (session: IAuthSession) => Promise<IAPIResponse<ILoginResponse>>;
  logout: (uuid: UUID) => Promise<void>;
}

const ClosureContext = createContext<ClosureContextType | undefined>(undefined);

interface ClosureProviderProps {
  children: ReactNode;
}
const log = LOG.extend('ClosureProvider');

const ClosureProvider = ({ children }: ClosureProviderProps) => {
  const { apiClients, updateAppConfig } = useData();
  const { idServerClient } = apiClients;

  const login = async (session: IAuthSession): Promise<IAPIResponse<ILoginResponse>> => {
    try {
      const { credential } = session;
      if (!credential) {
        return {
          code: 0,
          message: 'Missing credentials',
        };
      }
      const { email, password } = credential;
      if (!email || !password) {
        return {
          code: 0,
          message: 'Email and password are required',
        };
      }

      const response = await idServerClient.login(email, password);

      if (response.code !== 200 && response.code !== 0) {
        return {
          code: 0,
          message: response.message || 'Login failed',
        };
      }

      if (!response.data) {
        return {
          code: 0,
          message: 'Invalid response from server',
        };
      }

      LOG.info('Login successful', { email });
      // decode token to get payload
      const payload = jwtDecode<IJWTPayload>(response.data.token);
      session.credential.token = response.data.token;
      session.payload = payload;
      // update response data to app config
      updateAppConfig((draft) => {
        draft.currentCredentialUUID = session.payload?.uuid || null;
        draft.credentialRecord[session.payload?.uuid || ''] = session;
      });

      return {
        code: 1,
        message: 'Login successful',
        data: response.data
      };
    } catch (error) {
      LOG.error('Login failed', error);
      return {
        code: 0,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  const logout = async (uuid: UUID): Promise<void> => {
    try {
      updateAppConfig((draft) => {
        draft.currentCredentialUUID = null;
        delete draft.credentialRecord[uuid];
      });
      LOG.info('Logout successful');
    } catch (error) {
      LOG.error('Logout failed', error);
      throw error;
    }
  }


  const values: ClosureContextType = {
    login,
    logout,
  };

  return <ClosureContext.Provider value={values}>{children}</ClosureContext.Provider>;
};




/**
 * 使用全局数据的 Hook
 */
const useClosure = (): ClosureContextType => {
  const context = useContext(ClosureContext);
  if (context === undefined) {
    throw new Error('useClosure must be used within a ClosureProvider');
  }
  return context;
};

export { ClosureProvider, useClosure };
