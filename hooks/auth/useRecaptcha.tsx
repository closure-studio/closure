import { useCallback, useRef, useState } from "react";
import { WebView } from "react-native-webview";
import { WebViewMessageEvent } from "react-native-webview/lib/WebViewTypes";

interface RecaptchaResult {
  token: string;
  error?: string;
}

interface UseRecaptchaReturn {
  getRecaptchaToken: () => Promise<RecaptchaResult>;
  RecaptchaWebView: React.FC;
  isReady: boolean;
}

const GOOGLE_RECAPTCHA_SITE_KEY = "6LfrMU0mAAAAADoo9vRBTLwrt5mU0HvykuR3l8uN";
const RECAPTCHA_SCRIPT_URL = `https://www.recaptcha.net/recaptcha/api.js?render=${GOOGLE_RECAPTCHA_SITE_KEY}`;
// reCAPTCHA 需要正确的 baseUrl 来生成有效的 token
const RECAPTCHA_BASE_URL = "https://closure.ltsc.vip";

export const useRecaptcha = (): UseRecaptchaReturn => {
  const webViewRef = useRef<WebView>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  const resolveRef = useRef<((value: RecaptchaResult) => void) | null>(null);

  // HTML 内容 - 从 URL 加载 reCAPTCHA 脚本
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
        <script src="${RECAPTCHA_SCRIPT_URL}"></script>
        <script>
          // 等待 reCAPTCHA 脚本加载完成后通知 React Native
          function checkRecaptchaReady() {
            if (typeof window.grecaptcha !== 'undefined' && typeof window.grecaptcha.execute === 'function') {
              window.grecaptcha.ready(function() {
                window.ReactNativeWebView.postMessage(JSON.stringify({ 
                  status: 'ready'
                }));
              });
            } else {
              // 如果还没加载完成，等待一段时间后重试
              setTimeout(checkRecaptchaReady, 100);
            }
          }
          
          window.addEventListener('load', function() {
            checkRecaptchaReady();
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
        console.log("reCAPTCHA script loaded and ready");
        setIsReady(true);
        return;
      }

      // 处理错误消息
      if (data.status === "error") {
        console.error("reCAPTCHA script error:", data.error);
        if (resolveRef.current) {
          resolveRef.current({
            token: "",
            error: data.error,
          });
          resolveRef.current = null;
        }
        return;
      }

      // 处理正常的 token 响应
      if (resolveRef.current) {
        resolveRef.current(data as RecaptchaResult);
        resolveRef.current = null;
      }
    } catch (error) {
      console.error("Error parsing WebView message:", error);
      if (resolveRef.current) {
        resolveRef.current({
          token: "",
          error: error instanceof Error ? error.message : "Unknown error",
        });
        resolveRef.current = null;
      }
    }
  }, []);

  // WebView 加载完成
  const handleWebViewLoad = useCallback(() => {
    console.log("reCAPTCHA WebView loaded");
  }, []);

  // WebView 加载错误
  const handleWebViewError = useCallback((syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error("reCAPTCHA WebView error:", nativeEvent);
    setIsReady(false);
  }, []);

  // 获取 reCAPTCHA token
  const getRecaptchaToken = useCallback((): Promise<RecaptchaResult> => {
    return new Promise((resolve, reject) => {
      if (!isReady || !webViewRef.current) {
        reject(
          new Error("WebView not ready. Please wait a moment and try again."),
        );
        return;
      }

      // 保存 resolve 函数
      resolveRef.current = resolve;

      const injectedCode = `
        (async function() {
          try {
            // 检查 grecaptcha 是否正确加载
            if (typeof window.grecaptcha === 'undefined' || typeof window.grecaptcha.execute !== 'function') {
              window.ReactNativeWebView.postMessage(JSON.stringify({ 
                token: '',
                error: 'reCAPTCHA script not loaded properly'
              }));
              return;
            }
            
            // 执行 reCAPTCHA 获取 token
            const token = await window.grecaptcha.execute('${GOOGLE_RECAPTCHA_SITE_KEY}', { action: 'submit' });
            
            if (!token) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ 
                token: '',
                error: 'reCAPTCHA token is empty'
              }));
              return;
            }
            
            // 返回结果
            window.ReactNativeWebView.postMessage(JSON.stringify({ 
              token: token 
            }));
          } catch (error) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ 
              token: '',
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
            token: "",
            error: "Request timeout after 10 seconds",
          });
          resolveRef.current = null;
        }
      }, 10000);
    });
  }, [isReady]);

  // WebView 组件
  const RecaptchaWebView: React.FC = useCallback(
    () => (
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent, baseUrl: RECAPTCHA_BASE_URL }}
        onLoad={handleWebViewLoad}
        onMessage={handleMessage}
        onError={handleWebViewError}
        style={{ height: 0, width: 0, opacity: 0 }}
        javaScriptEnabled={true}
        originWhitelist={["*"]}
        // 设置 User-Agent 模拟正常浏览器
        userAgent="Mozilla/5.0 (Linux; Android 10; Pixel 3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
      />
    ),
    [htmlContent, handleWebViewLoad, handleMessage, handleWebViewError],
  );

  return {
    getRecaptchaToken,
    RecaptchaWebView,
    isReady,
  };
};
