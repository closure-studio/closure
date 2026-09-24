import { RemoteArkHostApi } from './arkhost-api.remote';
import * as http from '@/services/http';
import { appStore } from '@/store';
import { mockActiveSession } from '@/mocks/auth';
import { mockArkHostGameListResponse } from '@/mocks/arkhost';
import { runVerification } from '@/features/verification';

jest.mock('@/features/verification', () => ({ runVerification: jest.fn() }));
const api = new RemoteArkHostApi();
beforeEach(() => {
  jest.restoreAllMocks(); jest.clearAllMocks();
  appStore.getState().selectApiNode('domestic');
  appStore.getState().setSession(mockActiveSession);
});

it('uses Google for game creation and sends only the supported platform value', async () => {
  jest.mocked(runVerification).mockResolvedValue('google-token');
  const request = jest.spyOn(http, 'requestJson').mockResolvedValue({ code: 1, data: null, message: 'ok' });
  const input = { account: 'doctor@example.com', password: ' secret ', platform: 1 as const };

  await expect(api.createGame(input)).resolves.toEqual({ data: undefined, ok: true });

  expect(runVerification).toHaveBeenCalledWith({ kind: 'google' }, expect.any(AbortSignal));
  expect(request).toHaveBeenCalledWith('https://api.ltsc.vip/game/', expect.objectContaining({
    accessToken: mockActiveSession.accessToken,
    body: input,
    captchaToken: 'google-token',
    method: 'POST',
  }));
});

it('does not send game creation when Google verification fails', async () => {
  jest.mocked(runVerification).mockRejectedValue(new Error('Verification cancelled'));
  const request = jest.spyOn(http, 'requestJson');

  await expect(api.createGame({ account: 'doctor', password: 'secret', platform: 2 })).rejects.toThrow('Verification cancelled');

  expect(request).not.toHaveBeenCalled();
});

it('uses Google only for game login with the selected endpoint', async () => {
  appStore.getState().selectApiNode('overseas');
  jest.mocked(runVerification).mockResolvedValue('google-token');
  const request = jest.spyOn(http, 'requestJson').mockResolvedValue({ code: 1, data: null, message: 'ok' });
  await api.loginGame('user/name');
  expect(runVerification).toHaveBeenCalledWith({ kind: 'google' }, expect.any(AbortSignal));
  expect(request).toHaveBeenCalledWith('https://api-tunnel.arknights.app/game/login/user%2Fname', expect.objectContaining({ accessToken: mockActiveSession.accessToken, captchaToken: 'google-token', method: 'POST' }));
});

it('does not fall back to Geetest when Google rejects the request', async () => {
  jest.mocked(runVerification).mockResolvedValue('google-token');
  const request = jest.spyOn(http, 'requestJson').mockResolvedValue({ code: -1100, data: null, message: 'rejected' });
  expect((await api.loginGame('account')).ok).toBe(false);
  expect(runVerification).toHaveBeenCalledTimes(1);
  expect(request).toHaveBeenCalledTimes(1);
});

it('submits game challenges under captcha_info without Google', async () => {
  const request = jest.spyOn(http, 'requestJson').mockResolvedValue({ code: 1, data: null, message: 'ok' });
  const captcha = { challenge: 'original', geetest_challenge: 'solved', geetest_validate: 'proof', geetest_seccode: 'code' };
  await api.submitGameCaptcha('account', captcha);
  expect(request).toHaveBeenCalledWith(expect.stringContaining('/game/config/account'), expect.objectContaining({ body: { captcha_info: captcha } }));
  await api.pauseGame('account'); await api.deleteGame('account');
  expect(runVerification).not.toHaveBeenCalled();
});

it('accepts game lists without inactive captcha challenge fields', async () => {
  if (mockArkHostGameListResponse.code !== 1) throw new Error('Expected game list fixture');
  const entry = mockArkHostGameListResponse.data[0];
  if (!entry) throw new Error('Expected game account fixture');
  const captchaInfo = {
    captcha_type: entry.captcha_info.captcha_type,
    created: entry.captcha_info.created,
  };
  jest.spyOn(http, 'requestJson').mockResolvedValue({
    code: 1,
    data: [{ ...entry, captcha_info: captchaInfo }],
    message: 'ok',
  });

  await expect(api.fetchGameList()).resolves.toMatchObject({
    ok: true,
    data: [{
      captcha_info: {
        ...captchaInfo,
        challenge: '',
        geetestId: '',
        gt: '',
        riskType: '',
      },
    }],
  });
});

it('distinguishes uninitialized detail from business errors and malformed payloads', async () => {
  const request = jest.spyOn(http, 'requestJson').mockResolvedValue({ code: 0, data: null, message: '游戏未初始化,无法获取信息' });
  await expect(api.fetchGameDetail('account')).resolves.toEqual({ ok: true, data: null });
  request.mockResolvedValue({ code: 0, data: null, message: 'other failure' });
  expect((await api.fetchGameDetail('account')).ok).toBe(false);
  request.mockResolvedValue({ code: 1, data: [], message: 'ok' });
  await expect(api.fetchGameDetail('account')).resolves.toMatchObject({ ok: false, error: { code: 'invalid-response' } });
});
