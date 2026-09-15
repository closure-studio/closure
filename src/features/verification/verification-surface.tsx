import { WebView } from 'react-native-webview';
import type { VerificationRequest } from '@/schemas/verification';
import { verificationHtml } from './verification-html';
import { acceptVerificationMessage } from './verification-message';
export function VerificationSurface({ request }: { request: VerificationRequest }) {
  return <WebView source={{ html: verificationHtml(request), baseUrl: 'https://closure.ltsc.vip' }} originWhitelist={['https://*', 'about:*']} onMessage={(event) => acceptVerificationMessage(event.nativeEvent.data, request)} javaScriptEnabled />;
}
