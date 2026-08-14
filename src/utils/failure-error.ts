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
