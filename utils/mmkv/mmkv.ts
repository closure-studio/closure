import { CONSTANTS } from "@/constants/constants";
import { Draft, produce } from "immer";
import { createMMKV, MMKV } from "react-native-mmkv";

/**
 * MMKV Storage with Immer Support (Singleton)
 *
 * 提供统一的 MMKV 存储接口，支持 Immer 不可变更新
 */
class MMKVStorage {
  private static instance: MMKVStorage;
  private storage: MMKV;
  private key: string;

  private constructor() {
    this.storage = createMMKV();
    this.key = CONSTANTS.STORAGE_KEYS.DEFAULT_STORAGE_KEY;
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): MMKVStorage {
    if (!MMKVStorage.instance) {
      MMKVStorage.instance = new MMKVStorage();
    }
    return MMKVStorage.instance;
  }

  /**
   * 获取字符串值
   */
  public getString(key: string): string | undefined {
    return this.storage.getString(key);
  }

  /**
   * 设置字符串值
   */
  public setString(key: string, value: string): void {
    this.storage.set(key, value);
  }

  /**
   * 获取 JSON 对象
   */
  public getObject<T>(key: string): T | null {
    const value = this.storage.getString(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Failed to parse JSON for key "${key}":`, error);
      return null;
    }
  }

  /**
   * 设置 JSON 对象
   */
  public setObject<T>(key: string, value: T): void {
    try {
      const jsonString = JSON.stringify(value);
      this.storage.set(key, jsonString);
    } catch (error) {
      console.error(`Failed to stringify object for key "${key}":`, error);
    }
  }

  /**
   * 使用 Immer 更新对象
   *
   * @param key 存储键
   * @param updater Immer 更新函数
   * @param defaultValue 如果键不存在时的默认值
   * @returns 更新后的对象
   *
   * @example
   * ```ts
   * // 更新用户信息
   * storage.updateObject('user', (draft) => {
   *   draft.name = 'John';
   *   draft.age = 30;
   * }, { name: '', age: 0 });
   *
   * // 更新数组
   * storage.updateObject('todos', (draft) => {
   *   draft.push({ id: 3, text: 'New task' });
   *   draft[0].done = true;
   * }, []);
   * ```
   */
  private updateObject<T>(
    key: string,
    updater: (draft: Draft<T>) => void,
    defaultValue: T,
  ): T {
    const currentState = this.getObject<T>(key) ?? defaultValue;
    const nextState = produce(currentState, updater);
    this.setObject(key, nextState);
    return nextState;
  }

  /**
   * 删除键值
   */
  public remove(key: string): void {
    this.storage.remove(key);
  }

  /**
   * 清空所有存储
   */
  public clearAll(): void {
    this.storage.clearAll();
  }

  /**
   * 检查键是否存在
   */
  public contains(key: string): boolean {
    return this.storage.contains(key);
  }

  /**
   * 获取所有键
   */
  public getAllKeys(): string[] {
    return this.storage.getAllKeys();
  }

  /**
   * 获取原始 MMKV 实例（用于高级用法）
   */
  public getRawStorage(): MMKV {
    return this.storage;
  }
}

// 导出单例实例
export const storage = MMKVStorage.getInstance();

/**
 * 存储键常量
 */
export const STORAGE_KEYS = {
  AUTH_CREDENTIALS: "auth_credentials",
  AUTH_INFO: "auth_info",
  SERVICE_CONFIGS: "service_configs",
  SETTINGS: "settings",
  ARK_HOST_CONFIG: "ark_host_config",
  ARK_HOST_GAMES_STATUS: "ark_host_games_status",
} as const;
