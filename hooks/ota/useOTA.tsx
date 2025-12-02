import * as Updates from "expo-updates";
import { useEffect } from "react";

/**
 * useOTA - 处理应用的 OTA (Over-The-Air) 更新
 * 
 * 该 Hook 会在生产环境中自动检查并应用可用的更新
 * 在开发环境中不会执行任何操作
 */
export function useOTA() {
  useEffect(() => {
    async function checkForUpdates() {
      // 只在生产环境中检查更新
      if (!__DEV__ && Updates.isEnabled) {
        try {
          const update = await Updates.checkForUpdateAsync();

          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            // 提示用户重启应用
            await Updates.reloadAsync();
          }
        } catch (error) {
          console.error("检查更新失败:", error);
        }
      }
    }

    checkForUpdates();
  }, []);
}

