

// UI -> dataProvider -> 业务逻辑 -> useAPI -> api
// useAPI 负责自身的维持，例如token刷新。不涉及业务逻辑

import { IAuthSession, IJWTPayload } from '@/types/auth';
import { IServiceConfigs } from '@/types/axios';
import ArkHostClient from '@/utils/axios/arkHost';
import ArkQuotaClient from '@/utils/axios/arkQuota';
import IdServerClient from '@/utils/axios/idServer';
import { LOG } from '@/utils/logger/logger';
import { jwtDecode } from "jwt-decode";
import { useEffect } from 'react';
import { isTokenExpired } from './utils';

interface IUseAPIParams {
    serviceConfigs: IServiceConfigs;
    authSession: IAuthSession | null;
    setAuthSession: (session: IAuthSession) => void;
}

export interface IAPIClients {
    arkHostClient: ArkHostClient;
    idServerClient: IdServerClient;
    arkQuotaClient: ArkQuotaClient;
}

const log = LOG.extend('useAPI');

export const useAPI = (props: IUseAPIParams): IAPIClients => {

    const { serviceConfigs, authSession, setAuthSession } = props;
    const { credential } = authSession || {};
    const arkHostClient = new ArkHostClient(serviceConfigs.ARK_HOST);
    const idServerClient = new IdServerClient(serviceConfigs.ID_SERVER);
    const arkQuotaClient = new ArkQuotaClient(serviceConfigs.ARK_QUOTA);

    // Token refresh function
    const refreshToken = async (): Promise<void> => {
        try {
            if (!authSession) {
                log.warn('No credentials available for token refresh.');
                return;
            }
            if (!credential) {
                log.warn('No credentials available for token refresh.');
                return;
            }
            const { email, password } = credential;
            if (!email || !password) {
                log.warn('Incomplete credentials for token refresh.');
                return;
            }
            // 这里需要您的登录凭据，可能需要从本地存储获取
            const resp = await idServerClient.login(email, password);
            if (resp?.data?.token) {
                const payload = jwtDecode<IJWTPayload>(resp.data.token);
                authSession.credential.token = resp.data.token;
                authSession.payload = payload;
                setAuthSession(authSession);
                return;
            }
            return;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return;
        }
    };

    useEffect(() => {
        arkHostClient.setBaseURL(serviceConfigs.ARK_HOST.HOST);
        idServerClient.setBaseURL(serviceConfigs.ID_SERVER.HOST);
        arkQuotaClient.setBaseURL(serviceConfigs.ARK_QUOTA.HOST);
    }, [serviceConfigs, authSession?.credential.token]);

    useEffect(() => {
        const payload = authSession?.payload;
        if (!payload) {
            return;
        }
        // Set token refresh logic for all clients except idServer
        arkHostClient.setTokenRefreshLogic(() => isTokenExpired(payload), refreshToken);
        arkQuotaClient.setTokenRefreshLogic(() => isTokenExpired(payload), refreshToken);
        idServerClient.setTokenRefreshLogic(() => isTokenExpired(payload), refreshToken);

        // update jwt token
        if (authSession?.credential.token) {
            const authValue = `Bearer ${authSession.credential.token}`;
            idServerClient.setAuthToken(authValue);
            arkQuotaClient.setAuthToken(authValue);
            arkHostClient.setAuthToken(authValue);
        }
    }, [authSession]);


    return {
        arkHostClient,
        idServerClient,
        arkQuotaClient,
    };

}