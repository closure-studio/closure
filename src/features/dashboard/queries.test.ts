import {
  arkHostQueryKeys,
  gameDetailQueryOptions,
  logsQueryOptions,
} from './queries';

describe('arkHostQueryKeys', () => {
  it('scopes detail and logs queries per account', () => {
    expect(arkHostQueryKeys.detail('A')).not.toEqual(arkHostQueryKeys.detail('B'));
    expect(arkHostQueryKeys.logs('A')).not.toEqual(arkHostQueryKeys.logs('B'));
  });

  it('keeps the same account key stable across reads', () => {
    expect(arkHostQueryKeys.detail('A')).toEqual(arkHostQueryKeys.detail('A'));
    expect(arkHostQueryKeys.logs('A')).toEqual(arkHostQueryKeys.logs('A'));
  });

  it('scopes game accounts by user id', () => {
    expect(arkHostQueryKeys.gameAccounts('user-1')).not.toEqual(
      arkHostQueryKeys.gameAccounts('user-2'),
    );
  });
});

describe('account query option factories', () => {
  it('builds options whose query keys match the per-account scoping', () => {
    expect(gameDetailQueryOptions('A').queryKey).toEqual(arkHostQueryKeys.detail('A'));
    expect(logsQueryOptions('A').queryKey).toEqual(arkHostQueryKeys.logs('A'));
  });

  it('never produces a cross-account cache hit from the same factory', () => {
    expect(gameDetailQueryOptions('A').queryKey).not.toEqual(gameDetailQueryOptions('B').queryKey);
    expect(logsQueryOptions('A').queryKey).not.toEqual(logsQueryOptions('B').queryKey);
  });
});
