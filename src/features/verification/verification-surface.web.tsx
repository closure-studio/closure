import { useEffect, useRef } from 'react';
import type { VerificationRequest } from '@/schemas/verification';
import { verificationHtml } from './verification-html';
import { acceptVerificationMessage } from './verification-message';
export function VerificationSurface({ request }: { request: VerificationRequest }) {
  const frame = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const receive = (event: MessageEvent<unknown>) => {
      if (event.source === frame.current?.contentWindow) acceptVerificationMessage(event.data, request);
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [request]);
  return <iframe ref={frame} title={request.kind} sandbox="allow-scripts" srcDoc={verificationHtml(request)} style={{ width: '100%', height: '100%', border: 0 }} />;
}
