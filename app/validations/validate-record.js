// Based on the class version in OP: https://github.com/lblod/frontend-organization-portal/blob/703b0f43acf7cd0f27feecee0363958f0692a9ab/app/models/abstract-validation-model.js#L32

export async function validateRecord(record, schema) {
  // Joi creates a copy of the record when validating, which EmberData does not like.
  // We convert the record to a pojo and pass that to Joi to bypass that problem.
  const serializedRecord = serializeRecord(record);

  try {
    await schema.validateAsync(serializedRecord, {
      abortEarly: false,
      allowUnknown: true,
    });
  } catch (error) {
    const errors = error.details?.reduce((acc, err) => {
      acc[err.context.key] = err.message;
      return acc;
    }, {});

    return { isValid: false, errors };
  }

  return { isValid: true };
}

function serializeRecord(record) {
  const serializedModel = serializeRecordWithDepthControl(record);

  // Remove id on the top level
  delete serializedModel.id;

  return serializedModel;
}

function serializeRecordWithDepthControl(record, maxDepth = 2) {
  if (!record || maxDepth < 0) {
    return undefined;
  }

  const entries = [...record.constructor.fields, ['id', 'attribute']].map(
    ([key, type]) => {
      if (type === 'attribute') {
        return [key, record[key]];
      } else if (type === 'belongsTo') {
        const belongsTo = record.belongsTo(key).value();

        return [key, serializeRecordWithDepthControl(belongsTo, maxDepth - 1)];
      } else if (type === 'hasMany') {
        const hasMany = record.hasMany(key).value();
        if (!hasMany?.length) return [key, undefined];
        const values = hasMany.map((item) => {
          return item.toString();
        });
        return [key, values];
      } else {
        // assert(`Unknown field type: ${type}`);
      }
    },
  );

  return Object.fromEntries(entries);
}
