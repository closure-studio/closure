type TypedFailure = {
  code: string;
  diagnosticMessage?: string;
  kind: string;
};

export class FailureError<T extends TypedFailure> extends Error {
  constructor(readonly failure: T) {
    super(`Request failed (${failure.code})`);
    this.name = 'FailureError';
  }

  get code(): T['code'] {
    return this.failure.code;
  }
}

export function unwrapResult<T, E extends TypedFailure>(
  result: { ok: true; data: T } | { ok: false; error: E },
): T {
  if (!result.ok) throw new FailureError(result.error);
  return result.data;
}
