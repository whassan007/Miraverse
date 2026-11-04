import { describe, expect, it } from 'vitest';
import { V06_ROUTES } from '../../../../apps/web/src/app/v06/routes';
import { buildRobloxLaunchInfo } from '../../../../apps/web/src/launch/RobloxLaunchPage';
import { V06_PAYMENT_FLAGS, resolveWebDeliverablePrice } from '../../../../apps/api/src/payments/index';
import { generateOpaqueGiftCodeV06, hashGiftCodeV06 } from '../../../../apps/api/src/gifts/v06/index';
import { V06_WORLD_AVAILABILITY, validateQuestEventEnvelopeV06 } from '../../../../packages/contracts/v06/index';

describe('CX13 — Option A Website Routes, Truthful Roblox Launcher, Adult Test Commerce & Gift Boundaries', () => {
  it('registers all required Option A routes including /explore, /adventures, /characters, /play, /minecraft, /shop, /gifts, /parents, and /legacy-game', () => {
    const paths = V06_ROUTES.map((r) => r.path);
    expect(paths).toContain('/');
    expect(paths).toContain('/explore');
    expect(paths).toContain('/explore/:country');
    expect(paths).toContain('/adventures');
    expect(paths).toContain('/characters');
    expect(paths).toContain('/play');
    expect(paths).toContain('/play/:country');
    expect(paths).toContain('/minecraft');
    expect(paths).toContain('/shop');
    expect(paths).toContain('/gifts');
    expect(paths).toContain('/gifts/redeem');
    expect(paths).toContain('/parents');
    expect(paths).toContain('/parent/dashboard');
    expect(paths).toContain('/account');
    expect(paths).toContain('/help');
    expect(paths).toContain('/legal/privacy');
    expect(paths).toContain('/legal/terms');
    expect(paths).toContain('/legacy-game');
  });

  it('enforces truthful Roblox launch metadata without fabricating Place IDs or claiming browser-to-DataStore sync', () => {
    const info = buildRobloxLaunchInfo('LB');
    expect(info.targetCountry).toBe('LB');
    expect(info.availability.release_wave).toBe('RC1_FLAGSHIP');
    expect(info.publishingStatus).toBe('STAGING_UNPUBLISHED_HUMAN_APPROVAL_REQUIRED');
    expect(info.syncsBrowserStateToRoblox).toBe(false);
    expect(V06_WORLD_AVAILABILITY.EG.release_wave).toBe('RC3_EXPANSION');
  });

  it('enforces Stripe test-mode only, web-only deliverable SKUs, and opaque hashed gift codes', () => {
    expect(V06_PAYMENT_FLAGS.STRIPE_LIVE_ENABLED).toBe(false);
    expect(V06_PAYMENT_FLAGS.ENABLE_SUBSCRIPTIONS).toBe(false);
    expect(V06_PAYMENT_FLAGS.ALLOW_NATIVE_GAME_UNLOCKS).toBe(false);

    const sku = resolveWebDeliverablePrice('sku_byblos_storybook_pack');
    expect(sku.unlocksRobloxOrMinecraftItems).toBe(false);

    const gift = generateOpaqueGiftCodeV06();
    expect(gift.rawCode.startsWith('MVGIFT-')).toBe(true);
    expect(hashGiftCodeV06(gift.rawCode)).toBe(gift.codeHash);

    const validEnv = validateQuestEventEnvelopeV06({
      event_id: 'evt_lb_001',
      player_id: '12345',
      quest_id: 'QUEST_LB_MAIN_V06',
      objective_id: 'obj_gather_zaatar',
      challenge_type: 'gather',
      country_id: 'LB',
      object_or_item_ids: ['zaatar_thyme'],
      server_timestamp: Date.now(),
      reward_status: 'GRANTED',
      mira_tokens_awarded: 20,
    });
    expect(validEnv.valid).toBe(true);
  });
});

import { resolveRobloxPlayAction } from '../../../../apps/web/src/launch/RobloxLaunchPage';

describe('Roblox Play button honesty (audit P0)', () => {
  it('never labels the button "Play" without a published, verified share URL', () => {
    const a = resolveRobloxPlayAction(undefined, 'Lebanon');
    expect(a.kind).toBe('not-published');
    expect(a.label).not.toMatch(/^▶?\s*Play/i);
  });
  it('only offers a launch action when PUBLISHED with an official share URL', () => {
    const a = resolveRobloxPlayAction({ configuredPlaceId: '1', officialShareUrl: 'https://www.roblox.com/games/1/x', publishingStatus: 'PUBLISHED' }, 'Lebanon');
    expect(a.kind).toBe('launch');
    expect(a.href).toContain('roblox.com/games/1');
  });
});
