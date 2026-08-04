import { usePreventRemove } from 'expo-router/react-navigation';
import { useEffect, useRef } from 'react';

const backDismissals = new Map<symbol, () => void>();

export function dismissTopBackOverlay(): boolean {
  const dismissals = Array.from(backDismissals.values());
  const dismiss = dismissals[dismissals.length - 1];
  if (!dismiss) return false;

  dismiss();
  return true;
}

/**
 * Registers an open Sheet or Dialog as the first consumer of any supported back action.
 * React Navigation covers stack/browser/iOS removal attempts; the shared registry covers
 * Android hardware back before the page-level policy runs.
 */
export function useBackDismissal(open: boolean, onDismiss: () => void): void {
  const registrationId = useRef(Symbol('back-dismissal'));

  usePreventRemove(open, () => {
    onDismiss();
  });

  useEffect(() => {
    if (!open) return undefined;

    const id = registrationId.current;
    backDismissals.set(id, onDismiss);
    return () => {
      backDismissals.delete(id);
    };
  }, [onDismiss, open]);
}
