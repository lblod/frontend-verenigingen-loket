import {
  vertegenwoordigerValidationSchema,
  type Vertegenwoordiger,
} from 'frontend-verenigingen-loket/utils/verenigingsregister';
import type { Schema, ValidationOptions } from 'joi';
import { module, test } from 'qunit';

type ValidatedVertegenwoordiger = Partial<Vertegenwoordiger>;

module('Unit | Utility | verenigingsregister', function () {
  module('Validations', function () {
    module('Vertegenwoordiger', function () {
      test('valid vertegenwoordiger', async function (assert) {
        const validVertegenwoordiger: ValidatedVertegenwoordiger = {
          voornaam: 'Jan',
          achternaam: 'Janssens',
          'e-mail': 'jan.janssens@example.com',
        };

        const result = await validate(
          vertegenwoordigerValidationSchema,
          validVertegenwoordiger,
        );

        assert.ok(result);
      });

      test('valid new vertegenwoordiger', async function (assert) {
        const validVertegenwoordiger: ValidatedVertegenwoordiger = {
          voornaam: 'Jan',
          achternaam: 'Janssens',
          insz: '90031910473',
          'e-mail': 'jan.janssens@example.com',
        };

        const result = await validate(
          vertegenwoordigerValidationSchema,
          validVertegenwoordiger,
          {
            context: {
              isNew: true,
            },
          },
        );

        assert.ok(result);
      });

      test('voornaam is required', async function (assert) {
        const invalidVertegenwoordiger = {
          achternaam: 'Janssens',
          'e-mail': 'jan.janssens@example.com',
        };
        await assert.rejects(
          validate(vertegenwoordigerValidationSchema, invalidVertegenwoordiger),
          /Dit veld is verplicht/,
          'Missing voornaam should throw',
        );
      });

      test('achternaam is required', async function (assert) {
        const invalidVertegenwoordiger = {
          voornaam: 'Jan',
          insz: '80010100123',
          'e-mail': 'jan.janssens@example.com',
        };
        await assert.rejects(
          validate(vertegenwoordigerValidationSchema, invalidVertegenwoordiger),
          /Dit veld is verplicht/,
          'Missing achternaam should throw',
        );
      });

      test('`insz` is required if `isNew` is true', async function (assert) {
        const invalidVertegenwoordiger = {
          voornaam: 'Jan',
          achternaam: 'Janssens',
          'e-mail': 'jan.janssens@example.com',
        };
        await assert.rejects(
          validate(
            vertegenwoordigerValidationSchema,
            invalidVertegenwoordiger,
            { context: { isNew: true } },
          ),
          /Dit veld is verplicht/,
          'Missing insz when isNew should throw',
        );
      });

      test('it validates the given `insz`', async function (assert) {
        const invalidVertegenwoordiger = {
          voornaam: 'Jan',
          achternaam: 'Janssens',
          insz: '123',
          'e-mail': 'jan.janssens@example.com',
        };
        await assert.rejects(
          validate(vertegenwoordigerValidationSchema, invalidVertegenwoordiger),
          /Geen geldig rijksregisternummer/,
          'Invalid insz should throw',
        );
      });

      test('it validates the email format', async function (assert) {
        const invalidVertegenwoordiger = {
          voornaam: 'Jan',
          achternaam: 'Janssens',
          'e-mail': 'not-an-email',
        };
        await assert.rejects(
          validate(vertegenwoordigerValidationSchema, invalidVertegenwoordiger),
          /Geef een geldig e-mailadres in/,
          'Invalid e-mail should throw',
        );
      });

      test('it validates the phone format', async function (assert) {
        const invalidVertegenwoordiger = {
          voornaam: 'Jan',
          achternaam: 'Janssens',
          'e-mail': 'jan.janssens@example.com',
          telefoon: 'not-a-phone',
        };
        await assert.rejects(
          validate(vertegenwoordigerValidationSchema, invalidVertegenwoordiger),
          /Enkel een plusteken en cijfers zijn toegelaten/,
          'Invalid telefoon should throw',
        );
      });

      test('it validates the `socialMedia` uri format', async function (assert) {
        const invalidVertegenwoordiger = {
          voornaam: 'Jan',
          achternaam: 'Janssens',
          'e-mail': 'jan.janssens@example.com',
          socialMedia: 'not-a-uri',
        };
        await assert.rejects(
          validate(vertegenwoordigerValidationSchema, invalidVertegenwoordiger),
          /Geef een geldig internetadres in/,
          'Invalid socialMedia should throw',
        );
      });

      test('optional fields can be empty', async function (assert) {
        const validVertegenwoordiger: ValidatedVertegenwoordiger = {
          voornaam: 'Jan',
          achternaam: 'Janssens',
          'e-mail': 'jan.janssens@example.com',
          telefoon: '',
          socialMedia: '',
        };
        const result = await validate(
          vertegenwoordigerValidationSchema,
          validVertegenwoordiger,
        );
        assert.ok(result);
      });
    });
  });
});

async function validate<T>(
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
