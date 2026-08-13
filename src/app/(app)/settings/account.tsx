import { AccountSettingsScreen } from '@/features/settings';
import { useAppStore } from '@/store';

export default function SettingsAccountRoute() {
  const principal = useAppStore((state) => state.auth.session?.principal ?? null);
  const onUpdatePassword = useAppStore((state) => state.updatePassword);
  const passwordUpdateError = useAppStore((state) => state.auth.passwordUpdateError);
  const passwordUpdateStatus = useAppStore((state) => state.auth.passwordUpdateStatus);

  if (!principal) return null;

  return (
    <AccountSettingsScreen
      onUpdatePassword={onUpdatePassword}
      passwordUpdateError={passwordUpdateError}
      passwordUpdateStatus={passwordUpdateStatus}
      principal={principal}
    />
  );
}
