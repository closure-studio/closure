import { IAuthSession, UUID } from "@/types/auth";
import { useMemo } from "react";

interface IUseAuthParams {
  credentialList: Record<UUID, IAuthSession>;
  currentCredentialUUID: UUID | null;
}

interface IUseAuthReturn {
  isLogin: boolean;
  currentAuthSession: IAuthSession | null;
}

export const useAuth = (props: IUseAuthParams): IUseAuthReturn => {
  const { credentialList, currentCredentialUUID } = props;

  const currentAuthSession = useMemo(() => {
    if (currentCredentialUUID && credentialList[currentCredentialUUID]) {
      return credentialList[currentCredentialUUID];
    }
    return null;
  }, [credentialList, currentCredentialUUID]);

  const isLogin = useMemo(() => {
    return (
      currentCredentialUUID !== null && !!credentialList[currentCredentialUUID]
    );
  }, [credentialList, currentCredentialUUID]);

  return {
    isLogin,
    currentAuthSession,
  };
};
