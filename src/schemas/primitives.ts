import * as v from 'valibot';

export const nonNegativeIntegerSchema = v.pipe(v.number(), v.integer(), v.minValue(0));

export const nonBlankStringSchema = v.pipe(
  v.string(),
  v.check((value) => value.trim().length > 0),
);

export const nonEmptyStringSchema = v.pipe(v.string(), v.minLength(1));
