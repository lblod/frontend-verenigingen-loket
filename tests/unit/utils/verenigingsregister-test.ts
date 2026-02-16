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

      test('voornaam', async function (assert) {
        await assert.rejects(
          validate(vertegenwoordigerValidationSchema, {
            achternaam: 'Janssens',
            'e-mail': 'jan.janssens@example.com',
          }),
          /Dit veld is verplicht/,
          'Missing voornaam should throw',
        );

        await assert.rejects(
          validate(vertegenwoordigerValidationSchema, {
            voornaam: '',
            achternaam: 'Janssens',
            'e-mail': 'jan.janssens@example.com',
          }),
          /Dit veld is verplicht/,
          'an empty string is invalid',
        );

        await assert.rejects(
          validate(vertegenwoordigerValidationSchema, {
            voornaam: ' ',
            achternaam: 'Janssens',
            'e-mail': 'jan.janssens@example.com',
          }),
          /Dit veld is verplicht/,
          'whitespace is invalid',
        );

        await assert.rejects(
          validate(vertegenwoordigerValidationSchema, {
            voornaam: '123',
            achternaam: 'Janssens',
            'e-mail': 'jan.janssens@example.com',
          }),
          /Dit veld mag geen cijfers bevatten/,
          'numbers are not allowed',
        );

        await assert.rejects(
          validate(vertegenwoordigerValidationSchema, {
            voornaam: 'Jan 123',
            achternaam: 'Janssens',
            'e-mail': 'jan.janssens@example.com',
          }),
          /Dit veld mag geen cijfers bevatten/,
          'numbers are not allowed',
        );
      });

      test('achternaam', async function (assert) {
        await assert.rejects(
          validate(vertegenwoordigerValidationSchema, {
            voornaam: 'Jan',
            'e-mail': 'jan.janssens@example.com',
          }),
          /Dit veld is verplicht/,
          'Missing achternaam should throw',
        );

        await assert.rejects(
          validate(vertegenwoordigerValidationSchema, {
            voornaam: 'Jan',
            achternaam: '',
            'e-mail': 'jan.janssens@example.com',
          }),
          /Dit veld is verplicht/,
          'an empty string is invalid',
        );

        await assert.rejects(
          validate(vertegenwoordigerValidationSchema, {
            voornaam: 'Jan',
            achternaam: ' ',
            'e-mail': 'jan.janssens@example.com',
          }),
          /Dit veld is verplicht/,
          'whitespace is invalid',
        );

        await assert.rejects(
          validate(vertegenwoordigerValidationSchema, {
            voornaam: 'Jan',
            achternaam: '123',
            'e-mail': 'jan.janssens@example.com',
          }),
          /Dit veld mag geen cijfers bevatten/,
          'numbers are not allowed',
        );

        await assert.rejects(
          validate(vertegenwoordigerValidationSchema, {
            voornaam: 'Jan',
            achternaam: 'Janssens 123',
            'e-mail': 'jan.janssens@example.com',
          }),
          /Dit veld mag geen cijfers bevatten/,
          'numbers are not allowed',
        );
      });

      test('`insz` is required if `isNew` is true', async function (assert) {
        await assert.rejects(
          validate(
            vertegenwoordigerValidationSchema,
            {
              voornaam: 'Jan',
              achternaam: 'Janssens',
              'e-mail': 'jan.janssens@example.com',
            },
            { context: { isNew: true } },
          ),
          /Dit veld is verplicht/,
          'Missing insz when isNew should throw',
        );

        await assert.rejects(
          validate(
            vertegenwoordigerValidationSchema,
            {
              voornaam: 'Jan',
              achternaam: 'Janssens',
              'e-mail': 'jan.janssens@example.com',
              insz: '',
            },
            { context: { isNew: true } },
          ),
          /Dit veld is verplicht/,
          'an empty string is invalid',
        );
      });

      test('insz', async function (assert) {
        await assert.rejects(
          validate(vertegenwoordigerValidationSchema, {
            voornaam: 'Jan',
            achternaam: 'Janssens',
            insz: '123',
            'e-mail': 'jan.janssens@example.com',
          }),
          /Geen geldig rijksregisternummer/,
          'Invalid insz should throw',
        );

        await assert.rejects(
          validate(vertegenwoordigerValidationSchema, {
            voornaam: 'Jan',
            achternaam: 'Janssens',
            insz: ' ',
            'e-mail': 'jan.janssens@example.com',
          }),
          /Geen geldig rijksregisternummer/,
          'whitespace is invalid',
        );
      });

      test('e-mail', async function (assert) {
        await assert.rejects(
          validate(vertegenwoordigerValidationSchema, {
            voornaam: 'Jan',
            achternaam: 'Janssens',
            'e-mail': 'not-an-email',
          }),
          /Geef een geldig e-mailadres in/,
          'Invalid e-mail should throw',
        );

        await assert.rejects(
          validate(vertegenwoordigerValidationSchema, {
            voornaam: 'Jan',
            achternaam: 'Janssens',
            'e-mail': '',
          }),
          /Dit veld is verplicht/,
          'an empty string is invalid',
        );

        await assert.rejects(
          validate(vertegenwoordigerValidationSchema, {
            voornaam: 'Jan',
            achternaam: 'Janssens',
            'e-mail': ' ',
          }),
          /Geef een geldig e-mailadres in/,
          'whitespace is invalid',
        );
      });

      test('telefoon', async function (assert) {
        await assert.rejects(
          validate(vertegenwoordigerValidationSchema, {
            voornaam: 'Jan',
            achternaam: 'Janssens',
            'e-mail': 'jan.janssens@example.com',
            telefoon: 'not-a-phone',
          }),
          /Enkel een plusteken en cijfers zijn toegelaten/,
          'Invalid telefoon should throw',
        );

        await assert.rejects(
          validate(vertegenwoordigerValidationSchema, {
            voornaam: 'Jan',
            achternaam: 'Janssens',
            'e-mail': 'jan.janssens@example.com',
            telefoon: ' ',
          }),
          /Enkel een plusteken en cijfers zijn toegelaten/,
          'whitespace is invalid',
        );
      });

      test('socialMedia', async function (assert) {
        await assert.rejects(
          validate(vertegenwoordigerValidationSchema, {
            voornaam: 'Jan',
            achternaam: 'Janssens',
            'e-mail': 'jan.janssens@example.com',
            socialMedia: 'not-a-uri',
          }),
          /Geef een geldig internetadres in/,
          'Invalid socialMedia should throw',
        );

        await assert.rejects(
          validate(vertegenwoordigerValidationSchema, {
            voornaam: 'Jan',
            achternaam: 'Janssens',
            'e-mail': 'jan.janssens@example.com',
            socialMedia: ' ',
          }),
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
