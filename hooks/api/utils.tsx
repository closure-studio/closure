import { IJWTPayload } from "@/types/auth";

// Token validation function
export const isTokenExpired = (payload?: IJWTPayload): boolean => {
    if (!payload) return true;
    if (!payload?.exp) return true;
    // 提前半小时（1800秒），exp 是秒，Date.now() 是毫秒
    const bufferSeconds = 1800;
    const bufferMillis = bufferSeconds * 1000;
    return Date.now() >= (payload.exp * 1000 - bufferMillis);
};