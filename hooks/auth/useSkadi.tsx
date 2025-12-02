import { useCallback, useRef, useState } from "react";
import { WebView } from "react-native-webview";
import { WebViewMessageEvent } from "react-native-webview/lib/WebViewTypes";

interface SkadiResult {
  noise: string;
  sign: string;
  error?: string;
}

interface UseSkadiReturn {
  getNoiseAndSign: (email: string, password: string) => Promise<SkadiResult>;
  SkadiWebView: React.FC;
  isReady: boolean;
}

const SKADI_SCRIPT_URL = "https://closure.ltsc.vip/skadi.js";

export const useSkadi = (): UseSkadiReturn => {
  const webViewRef = useRef<WebView>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  const resolveRef = useRef<((value: SkadiResult) => void) | null>(null);

  // HTML 内容 - 从 URL 加载脚本
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
        <script src="${SKADI_SCRIPT_URL}"></script>
        <script>
          // 等待脚本加载完成后通知 React Native
          window.addEventListener('load', function() {
            setTimeout(function() {
              if (typeof window.idaks !== 'undefined' && typeof window.skadi !== 'undefined') {
                window.ReactNativeWebView.postMessage(JSON.stringify({ 
                  status: 'ready'
                }));
              } else {
                window.ReactNativeWebView.postMessage(JSON.stringify({ 
                  status: 'error',
                  error: 'Skadi script not loaded'
                }));
              }
            }, 100);
          });
        </script>
    </body>
    </html>
  `;

  // 处理从 WebView 返回的消息
  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      // 处理脚本就绪消息
      if (data.status === "ready") {
        console.log("Skadi script loaded and ready");
        setIsReady(true);
        return;
      }

      // 处理错误消息
      if (data.status === "error") {
        console.error("Skadi script error:", data.error);
        return;
      }

      // 处理正常的 noise/sign 响应
      if (resolveRef.current) {
        resolveRef.current(data as SkadiResult);
        resolveRef.current = null;
      }
    } catch (error) {
      console.error("Error parsing WebView message:", error);
      if (resolveRef.current) {
        resolveRef.current({
          noise: "",
          sign: "",
          error: error instanceof Error ? error.message : "Unknown error",
        });
        resolveRef.current = null;
      }
    }
  }, []);

  // WebView 加载完成
  const handleWebViewLoad = useCallback(() => {
    console.log("WebView loaded");
  }, []);

  // WebView 加载错误
  const handleWebViewError = useCallback((syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error("WebView error:", nativeEvent);
    setIsReady(false);
  }, []);

  // 获取 noise 和 sign
  const getNoiseAndSign = useCallback(
    (email: string, password: string): Promise<SkadiResult> => {
      return new Promise((resolve, reject) => {
        if (!isReady || !webViewRef.current) {
          reject(
            new Error("WebView not ready. Please wait a moment and try again."),
          );
          return;
        }

        // 保存 resolve 函数
        resolveRef.current = resolve;

        // 转义特殊字符防止注入
        const escapedEmail = email
          .replace(/\\/g, "\\\\")
          .replace(/"/g, '\\"')
          .replace(/\n/g, "\\n")
          .replace(/\r/g, "\\r");
        const escapedPassword = password
          .replace(/\\/g, "\\\\")
          .replace(/"/g, '\\"')
          .replace(/\n/g, "\\n")
          .replace(/\r/g, "\\r");

        const injectedCode = `
          (function() {
            try {
              // 检查 skadi 脚本是否正确加载
              if (typeof window.idaks === 'undefined' || typeof window.skadi === 'undefined') {
                window.ReactNativeWebView.postMessage(JSON.stringify({ 
                  noise: '',
                  sign: '',
                  error: 'Skadi script not loaded properly'
                }));
                return;
              }
              
              // 生成 noise
              const noise = window.idaks.join("");
              
              // 生成 sign
              const input = "${escapedEmail}&${escapedPassword}&" + noise;
              const sign = window.skadi(input);
              
              // 返回结果
              window.ReactNativeWebView.postMessage(JSON.stringify({ 
                noise: noise, 
                sign: sign 
              }));
            } catch (error) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ 
                noise: '',
                sign: '',
                error: error.message 
              }));
            }
          })();
          true;
        `;

        webViewRef.current.injectJavaScript(injectedCode);

        // 设置超时保护
        setTimeout(() => {
          if (resolveRef.current) {
            resolveRef.current({
              noise: "",
              sign: "",
              error: "Request timeout after 5 seconds",
            });
            resolveRef.current = null;
          }
        }, 5000);
      });
    },
    [isReady],
  );

  // WebView 组件
  const SkadiWebView: React.FC = useCallback(
    () => (
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        onLoad={handleWebViewLoad}
        onMessage={handleMessage}
        onError={handleWebViewError}
        style={{ height: 0, width: 0, opacity: 0 }}
        javaScriptEnabled={true}
        originWhitelist={["*"]}
      />
    ),
    [htmlContent, handleWebViewLoad, handleMessage, handleWebViewError],
  );

  return {
    getNoiseAndSign,
    SkadiWebView,
    isReady,
  };
};
