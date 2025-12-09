// 用户信息（ArkQuota /api/users/me）
export enum QuotaRuleFlag {
  SlotUserQQVerified = "slot_user_qq_verified",
  SlotUserSMSVerified = "slot_user_sms_verified",
  SlotAccountFormatIsPhone = "slot_account_format_is_phone",
  SlotAccountSMSVerified = "slot_account_sms_verified",
}

export interface IQuotaUserSlot {
  uuid: string;
  ruleFlags: QuotaRuleFlag[];
  gameAccount: unknown | null;
  useFlagDefaults: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface IQuotaUser {
  uuid: string;
  rules: string[];
  ruleFlags: QuotaRuleFlag[];
  slots: IQuotaUserSlot[];
  idServerStatus: number;
  idServerPermission: number;
  idServerPhone: string;
  idServerQQ: string;
  createdAt: number;
  updatedAt: number;
}
