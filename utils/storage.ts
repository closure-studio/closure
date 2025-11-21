import { createMMKV } from 'react-native-mmkv';

/**
 * MMKV Storage Utility
 * 
 * 提供统一的 MMKV 存储接口
 */
export const storage = createMMKV();

/**
 * 存储工具函数
 */
export const storageUtils = {
    /**
     * 获取字符串值
     */
    getString: (key: string): string | undefined => {
        return storage.getString(key);
    },

    /**
     * 设置字符串值
     */
    setString: (key: string, value: string): void => {
        storage.set(key, value);
    },

    /**
     * 获取 JSON 对象
     */
    getObject: <T>(key: string): T | null => {
        const value = storage.getString(key);
        if (!value) return null;
        
        try {
            return JSON.parse(value) as T;
        } catch (error) {
            console.error(`Failed to parse JSON for key "${key}":`, error);
            return null;
        }
    },

    /**
     * 设置 JSON 对象
     */
    setObject: <T>(key: string, value: T): void => {
        try {
            const jsonString = JSON.stringify(value);
            storage.set(key, jsonString);
        } catch (error) {
            console.error(`Failed to stringify object for key "${key}":`, error);
        }
    },

    /**
     * 删除键值
     */
    remove: (key: string): void => {
        storage.remove(key);
    },

    /**
     * 清空所有存储
     */
    clearAll: (): void => {
        storage.clearAll();
    },

    /**
     * 检查键是否存在
     */
    contains: (key: string): boolean => {
        return storage.contains(key);
    },
};

/**
 * 存储键常量
 */
export const STORAGE_KEYS = {
    AUTH_CREDENTIALS: 'auth_credentials',
    AUTH_INFO: 'auth_info',
    SERVICE_CONFIGS: 'service_configs',
    SETTINGS: 'settings',
    ARK_HOST_CONFIG: 'ark_host_config',
    ARK_HOST_GAMES_STATUS: 'ark_host_games_status',
} as const;
