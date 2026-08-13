import { ARK_RESOURCES_ORIGIN } from '@/config/ark-resources';

const ITEM_IMAGE_BASE_URL = `${ARK_RESOURCES_ORIGIN}/assets/items`;

export function getItemImageUrl(icon: string): string {
  return `${ITEM_IMAGE_BASE_URL}/${encodeURIComponent(icon)}.webp`;
}
