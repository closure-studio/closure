import { ARK_RESOURCES_ORIGIN } from '@/constants/api';
import { getGameAvatarImageUrl } from './avatar-image';

describe('getGameAvatarImageUrl', () => {
  it('returns null for a missing avatar', () => {
    expect(getGameAvatarImageUrl(null)).toBeNull();
    expect(getGameAvatarImageUrl(undefined)).toBeNull();
  });

  it('returns null when id or type is empty', () => {
    expect(getGameAvatarImageUrl({ id: '', type: '' })).toBeNull();
    expect(getGameAvatarImageUrl({ id: 'avatar_dyn_01', type: '' })).toBeNull();
    expect(getGameAvatarImageUrl({ id: '', type: 'ICON' })).toBeNull();
  });

  it('returns null for ICON-type avatars', () => {
    expect(getGameAvatarImageUrl({ id: 'avatar_dyn_01', type: 'ICON' })).toBeNull();
  });

  it('builds the asset URL for ASSISTANT and DEFAULT avatars', () => {
    expect(getGameAvatarImageUrl({ id: 'char_003_kalts_sale_14', type: 'ASSISTANT' }))
      .toBe(`${ARK_RESOURCES_ORIGIN}/assets/avatar/ASSISTANT/char_003_kalts_sale_14.webp`);
    expect(getGameAvatarImageUrl({ id: 'avatar_def_10', type: 'DEFAULT' }))
      .toBe(`${ARK_RESOURCES_ORIGIN}/assets/avatar/DEFAULT/avatar_def_10.webp`);
  });
});
