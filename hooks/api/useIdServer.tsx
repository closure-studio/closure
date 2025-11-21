import IdServerClient from '@/services/axios/idServer';
import { IServiceConfig } from '@/types/axios';
import { createContext, useContext } from 'react';



// UI -> dataProvider -> idServer -> useIdServer -> api

// 默认配置
const DEFAULT_CONFIG: IServiceConfig = {
    HOST: process.env.EXPO_PUBLIC_ID_SERVER_HOST || 'http://localhost:3000',
};

// 创建 Context
const IdServerContext = createContext<IdServerClient | null>(null);

/**
 * useIdServer Hook
 * 
 * 用于访问 IdServerClient 实例
 * @returns IdServerClient 实例
 * @throws 如果在 Provider 外部使用会抛出错误
 */
export function useIdServer(): IdServerClient {
    const context = useContext(IdServerContext);
    
    if (!context) {
        throw new Error('useIdServer must be used within Providers');
    }
    
    return context;
}

// 导出 Context 和配置供 Provider 使用
export { DEFAULT_CONFIG as ID_SERVER_DEFAULT_CONFIG, IdServerContext };

