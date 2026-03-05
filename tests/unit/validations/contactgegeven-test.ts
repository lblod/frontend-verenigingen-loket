import { contactgegevenValidationSchema } from 'frontend-verenigingen-loket/templates/association/contact-details/edit';
import { module, test } from 'qunit';
import { validate } from 'frontend-verenigingen-loket/tests/helpers/validate';
import type { Contactgegeven } from 'frontend-verenigingen-loket/utils/verenigingsregister';

module('Unit | Validation | Contactgegeven', function () {
  test('contactgegeventype is required', async function (assert) {
    const contactgegeven: Partial<Contactgegeven> = {};

    await assert.rejects(
      validate(contactgegevenValidationSchema, contactgegeven),
    );
  });

  module('E-mail', function () {
    const contactgegevenBase: Partial<Contactgegeven> = {
      contactgegeventype: 'E-mail',
    };

    test('waarde is required', async function (assert) {
      await assert.rejects(
        validate(contactgegevenValidationSchema, { ...contactgegevenBase }),
      );
    });

    test('email should be valid', async function (assert) {
      await assert.rejects(
        validate(contactgegevenValidationSchema, {
          ...contactgegevenBase,
          waarde: 'not-an-email',
        }),
      );
    });

    test('valid email', async function (assert) {
      try {
        await validate(contactgegevenValidationSchema, {
          ...contactgegevenBase,
          waarde: 'foo@bar.be',
        });
        assert.step('no error');
      } catch {
        assert.step('error');
      }

      assert.verifySteps(['no error']);
    });
  });

  module('Telefoon', function () {
    const contactgegevenBase: Partial<Contactgegeven> = {
      contactgegeventype: 'Telefoon',
    };

    test('waarde is required', async function (assert) {
      await assert.rejects(
        validate(contactgegevenValidationSchema, { ...contactgegevenBase }),
      );
    });

    test('phone number should be valid', async function (assert) {
      await assert.rejects(
        validate(contactgegevenValidationSchema, {
          ...contactgegevenBase,
          waarde: 'abcd',
        }),
      );
    });

    test('valid', async function (assert) {
      try {
        await validate(contactgegevenValidationSchema, {
          ...contactgegevenBase,
          waarde: '123456789',
        });

        await validate(contactgegevenValidationSchema, {
          ...contactgegevenBase,
          waarde: '+32123456789',
        });

        assert.step('no error');
      } catch {
        assert.step('no error');
      }

      assert.verifySteps(['no error']);
    });
  });

  module('Website', function () {
    const contactgegevenBase: Partial<Contactgegeven> = {
      contactgegeventype: 'Website',
    };

    test('waarde is required', async function (assert) {
      await assert.rejects(
        validate(contactgegevenValidationSchema, { ...contactgegevenBase }),
      );
    });

    test('url should be valid', async function (assert) {
      await assert.rejects(
        validate(contactgegevenValidationSchema, {
          ...contactgegevenBase,
          waarde: 'abcd',
        }),
      );

      await assert.rejects(
        validate(contactgegevenValidationSchema, {
          ...contactgegevenBase,
          waarde: 'website.be',
        }),
        'it should include the protocol',
      );
    });

    test('valid', async function (assert) {
      try {
        await validate(contactgegevenValidationSchema, {
          ...contactgegevenBase,
          waarde: 'https://vlaanderen.be',
        });

        await validate(contactgegevenValidationSchema, {
          ...contactgegevenBase,
          waarde: 'http://vlaanderen.be',
        });

        assert.step('no error');
      } catch {
        assert.step('error');
      }
      assert.verifySteps(['no error']);
    });
  });

  module('SocialMedia', function () {
    const contactgegevenBase: Partial<Contactgegeven> = {
      contactgegeventype: 'SocialMedia' as const,
    };

    test('waarde is required', async function (assert) {
      await assert.rejects(
        validate(contactgegevenValidationSchema, { ...contactgegevenBase }),
      );
    });

    test('url should be valid', async function (assert) {
      await assert.rejects(
        validate(contactgegevenValidationSchema, {
          ...contactgegevenBase,
          waarde: 'not-a-url',
        }),
      );
    });

    test('valid', async function (assert) {
      try {
        await validate(contactgegevenValidationSchema, {
          ...contactgegevenBase,
          waarde: 'https://twitter.com/someone',
        });
        assert.step('no error');
      } catch {
        assert.step('error');
      }

      assert.verifySteps(['no error']);
    });
  });
});
