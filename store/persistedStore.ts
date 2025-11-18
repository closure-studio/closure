import { createMMKV } from 'react-native-mmkv';
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";
import { DEFAULT_CONSTANTS } from "../constants/constants";
import { GameStatusData, IArkHostConfig } from "../types/arkHost";
import { IAuthCredentials, IAuthInfo } from "../types/auth";
import { IServiceConfigs } from "../types/axios";
const storage = createMMKV()

// 创建 MMKV 适配器，实现 StateStorage 接口
const mmkvStorage: StateStorage = {
    getItem: (name: string): string | null => {
        const value = storage.getString(name);
        return value ?? null;
    },
    setItem: (name: string, value: string): void => {
        storage.set(name, value);
    },
    removeItem: (name: string): void => {
        storage.remove(name);
    },
};

// 定义设置类型
interface Settings {
    theme: "light" | "dark";
    language: "en" | "zh" | "es" | "fr";
    notifications?: boolean;
    fontSize?: "small" | "medium" | "large";
}

// 定义 Store 状态类型
interface AppState {
    // auth credentials
    authCredentials: IAuthCredentials | null;
    authInfo: IAuthInfo | null;
    // network config
    serviceConfigs: IServiceConfigs;
    // user: User | null
    settings: Settings;

    arkHost?: {
        config?: IArkHostConfig;
        gamesStatus?: GameStatusData[];
    }
}


interface AppActions {
    // auth credentials
    setAuthCredentials: (credentials: IAuthCredentials) => void;
    setAuthInfo: (info: IAuthInfo) => void;

    // network config
    setServiceConfigs: (configs: IServiceConfigs) => void;
    // setUser: (user: User | null) => void
    updateSettings: (newSettings: Partial<Settings>) => void;
    // clearUser: () => void
    resetSettings: () => void;

    // signOut: () => void
    signOut: () => void;

    // arkHost
    setArkHostConfig: (config: IArkHostConfig) => void;
    setArkHostGamesStatus: (status: GameStatusData[]) => void;
}

// 组合完整的 Store 类型
type AppStore = AppState & AppActions;

// 默认设置
const defaultSettings: Settings = {
    theme: "light",
    language: "en",
    notifications: true,
    fontSize: "medium",
};

const useStore = create<AppStore>()(
    persist(
        (set, get) => ({
            // auth credentials
            authCredentials: null,
            authInfo: null,
            // network config
            serviceConfigs: DEFAULT_CONSTANTS.SERVICE_CONFIGS,
            settings: defaultSettings,

            // auth credentials
            setAuthCredentials: (credentials: IAuthCredentials) =>
                set({ authCredentials: credentials }),
            setAuthInfo: (info: IAuthInfo) => set({ authInfo: info }),

            // network config
            setServiceConfigs: (configs: IServiceConfigs) =>
                set({ serviceConfigs: configs }),

            updateSettings: (newSettings: Partial<Settings>) =>
                set((state) => ({
                    settings: { ...state.settings, ...newSettings },
                })),

            // clearUser: () => set({ user: null }),

            resetSettings: () => set({ settings: defaultSettings }),

            // signOut action
            signOut: () => {
                set({ authCredentials: null, authInfo: null });
            },

            // arkHost
            setArkHostConfig: (config: IArkHostConfig) => {
                set((state) => ({
                    arkHost: { ...state.arkHost, config },
                }));
            },
            setArkHostGamesStatus: (gamesStatus: GameStatusData[]) => {
                set((state) => ({
                    arkHost: { ...state.arkHost, gamesStatus },
                }));
            },
        }),
        {
            name: "app-storage",
            storage: createJSONStorage(() => mmkvStorage),
            // 可选：只持久化特定字段
            partialize: (state) => ({
                // auth credentials
                authCredentials: state.authCredentials,
                authInfo: state.authInfo,
                // network config
                serviceConfigs: state.serviceConfigs,
                // user: state.user,
                settings: state.settings,
                arkHost: state.arkHost,
            }),
        }
    )
);

export default useStore;
