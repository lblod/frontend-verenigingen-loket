import { assert } from '@ember/debug';
import type Model from '@warp-drive/legacy/model';
import { ValidationError } from 'joi';
import type { Schema, ValidationOptions } from 'joi';

// Based on the class version in MOW: https://github.com/lblod/frontend-mow-registry/blob/31ac4078df0e77506919fa814cc6f7b071c5b56f/app/models/abstract-validation-model.ts

type ModelSchema = typeof Model;

export type ValidationResult = {
  isValid: boolean;
  errors?: ValidationErrorDetails;
};

export interface ValidationErrorDetails {
  [key: string]: string;
}

export async function validateRecord(
  record: Model,
  schema: Schema,
  validationOptions: ValidationOptions = {},
): Promise<ValidationResult> {
  // Joi creates a copy of the record when validating, which EmberData does not like.
  // We convert the record to a pojo and pass that to Joi to bypass that problem.
  const serializedRecord = serializeRecord(record);

  try {
    await schema.validateAsync(serializedRecord, {
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

      addErrorsToRecord(record, errors);

      return { isValid: false, errors };
    }
  }

  return { isValid: true };
}

function serializeRecord(record: Model) {
  const serializedModel = serializeRecordWithDepthControl(record);

  // Remove id on the top level, as it is not part of the validation schema
  if (serializedModel) delete serializedModel['id'];

  return serializedModel;
}

function serializeRecordWithDepthControl(
  record: Model | null,
  maxDepth = 2,
): { [key: string]: unknown } | undefined {
  if (!record || maxDepth < 0) {
    return undefined;
  }

  const modelSchema = record.constructor as unknown as ModelSchema;
  const fields = [...modelSchema.fields, ['id', 'attribute']] as [
    keyof Model,
    'belongsTo' | 'hasMany' | 'attribute',
  ][];
  const entries = fields.map(([key, type]) => {
    if (type === 'attribute') {
      return [key, record[key]];
    } else if (type === 'belongsTo') {
      // @ts-expect-error We can't pass types to .belongsTo since we don't know them. As a result this throws an error, but the code is valid.
      // TODO: I think we can achieve the same with different model methods, which maybe don't have this type issue.
      const belongsTo = record.belongsTo(key).value() as Model | null;

      return [key, serializeRecordWithDepthControl(belongsTo, maxDepth - 1)];
    } else if (type === 'hasMany') {
      // @ts-expect-error We can't pass types to .hasMany since we don't know them. As a result this throws an error, but the code is valid.
      // TODO: I think we can achieve the same with different model methods, which maybe don't have this type issue.
      const hasMany = record.hasMany(key).value();
      if (!hasMany?.length) return [key, undefined];
      const values = hasMany.map((item) => {
        return item?.toString?.();
      });
      return [key, values];
    } else {
      assert(`Unknown field type: ${type as string}`);
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return Object.fromEntries(entries);
}

function addErrorsToRecord(record: Model, errors: ValidationErrorDetails) {
  Object.entries(errors).forEach(([field, errorMessage]) => {
    record.errors.add(field, errorMessage);
  });
}
