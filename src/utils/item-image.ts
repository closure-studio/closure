import { ARK_RESOURCES_ORIGIN } from '@/constants/api';

const ITEM_IMAGE_BASE_URL = `${ARK_RESOURCES_ORIGIN}/assets/items`;

export function getItemImageUrl(icon: string): string {
  return `${ITEM_IMAGE_BASE_URL}/${encodeURIComponent(icon)}.webp`;
}
