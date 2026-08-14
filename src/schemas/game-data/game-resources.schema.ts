import * as v from 'valibot';

export const gameResourceUpdatedAtSchema = v.pipe(v.string(), v.isoTimestamp());
