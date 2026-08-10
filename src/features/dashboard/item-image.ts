const ITEM_IMAGE_BASE_URL = 'https://ark-resource.arknights.app/assets/items';

export function getItemImageUrl(icon: string): string {
  return `${ITEM_IMAGE_BASE_URL}/${encodeURIComponent(icon)}.webp`;
}
