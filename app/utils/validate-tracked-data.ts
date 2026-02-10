import type TrackedData from 'frontend-verenigingen-loket/utils/tracked-data';
import { ValidationError } from 'joi';
import type { Schema, ValidationOptions } from 'joi';

export interface ValidationErrorDetails {
  [key: string]: string;
}

export async function validateData<T extends object>(
  instance: TrackedData<T>,
  schema: Schema,
  validationOptions: ValidationOptions = {},
) {
  try {
    await schema.validateAsync(instance.data, {
      abortEarly: false,
      allowUnknown: true,
      ...validationOptions,
    });
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      const errors = error.details?.reduce((acc, err) => {
        if (err?.context?.key) {
          acc[err.context.key] = err.message;
        }
        return acc;
      }, {} as ValidationErrorDetails);

      addErrorsToInstance(instance, errors);
    }
  }
}

function addErrorsToInstance<T extends object>(
  instance: TrackedData<T>,
  errors: ValidationErrorDetails,
) {
  Object.entries(errors).forEach(([field, errorMessage]) => {
    // TODO: not sure how to deal with the string vs `keyof T` type conflict
    instance.addError(field as keyof T, errorMessage);
  });
}
