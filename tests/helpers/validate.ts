import type { Schema, ValidationOptions } from 'joi';

export async function validate<T>(
  schema: Schema,
  data: T,
  validationOptions: ValidationOptions = {},
): Promise<T> {
  return (await schema.validateAsync(data, {
    abortEarly: false,
    allowUnknown: true,
    ...validationOptions,
  })) as T;
}
