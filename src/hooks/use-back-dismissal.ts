import { usePreventRemove } from 'expo-router/react-navigation';

/**
 * Registers an open Sheet or Dialog as the first consumer of stack and browser back actions.
 */
export function useBackDismissal(open: boolean, onDismiss: () => void): void {
  usePreventRemove(open, () => {
    onDismiss();
  });
}
