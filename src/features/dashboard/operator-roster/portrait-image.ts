import { ARK_RESOURCES_ORIGIN } from '@/constants/api';

const PORTRAIT_IMAGE_BASE_URL = `${ARK_RESOURCES_ORIGIN}/assets/charpor`;
// charpor art is skin-numbered: {charId}_1 is the default outfit.
const DEFAULT_SKIN_INDEX = 1;

export function getOperatorPortraitUrl(charId: string): string {
  return `${PORTRAIT_IMAGE_BASE_URL}/${encodeURIComponent(`${charId}_${DEFAULT_SKIN_INDEX}`)}.webp`;
}
