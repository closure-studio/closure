import { ARK_RESOURCES_ORIGIN } from '@/constants/api';
import type { ArkHostAvatar } from '@/schemas/arkhost';

const GAME_AVATAR_IMAGE_BASE_URL = `${ARK_RESOURCES_ORIGIN}/assets/avatar`;

export function getGameAvatarImageUrl(
  avatar: ArkHostAvatar | null | undefined,
): string | null {
  if (!avatar) return null;
  const { id, type } = avatar;
  if (!id || !type || type === 'ICON') return null;
  return `${GAME_AVATAR_IMAGE_BASE_URL}/${type}/${encodeURIComponent(id)}.webp`;
}
