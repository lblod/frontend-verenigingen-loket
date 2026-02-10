import {
  CONTACT_DATA_TYPE,
  validationSchema,
} from 'frontend-verenigingen-loket/models/contact-point';
import { validateRecord } from 'frontend-verenigingen-loket/utils/validate-record';
import { setupTest } from 'frontend-verenigingen-loket/tests/helpers';
import { module, test } from 'qunit';

module('Unit | Model | contact point', function (hooks) {
  setupTest(hooks);

  module('validations', function () {
    test('name', async function (assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('contact-point', {});

      let validationResult = await validateRecord(model, validationSchema);
      assert.false(validationResult.isValid, 'name is required');
      assert.strictEqual(Object.keys(validationResult.errors).length, 1);
      assert.ok(validationResult.errors.name);

      model.name = 'foo';
      validationResult = await validateRecord(model, validationSchema);
      assert.false(
        validationResult.isValid,
        'name can only be a specific type',
      );
      assert.strictEqual(Object.keys(validationResult.errors).length, 1);
      assert.ok(validationResult.errors.name);
    });

    test('email', async function (assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('contact-point', {
        name: CONTACT_DATA_TYPE.EMAIL,
      });

      let validationResult = await validateRecord(model, validationSchema);
      assert.false(
        validationResult.isValid,
        "email is required when it's a contact point of type email",
      );
      assert.strictEqual(Object.keys(validationResult.errors).length, 1);
      assert.ok(validationResult.errors.email);

      model.email = 'foo';
      validationResult = await validateRecord(model, validationSchema);
      assert.false(validationResult.isValid, 'must be a valid email');
      assert.strictEqual(Object.keys(validationResult.errors).length, 1);
      assert.ok(validationResult.errors.email);

      model.email = 'foo@bar.be';
      validationResult = await validateRecord(model, validationSchema);
      assert.true(validationResult.isValid, 'email is valid');
      assert.notOk(validationResult.errors);
    });

    test('telephone', async function (assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('contact-point', {
        name: CONTACT_DATA_TYPE.TELEPHONE,
      });

      let validationResult = await validateRecord(model, validationSchema);
      assert.false(
        validationResult.isValid,
        "telephone is required when it's a contact point of type telephone",
      );
      assert.strictEqual(Object.keys(validationResult.errors).length, 1);
      assert.ok(validationResult.errors.telephone);

      model.telephone = 'abcd';
      validationResult = await validateRecord(model, validationSchema);
      assert.false(
        validationResult.isValid,
        'must be a valid telephone number',
      );
      assert.strictEqual(Object.keys(validationResult.errors).length, 1);
      assert.ok(validationResult.errors.telephone);

      model.telephone = '123456789';
      validationResult = await validateRecord(model, validationSchema);
      assert.true(validationResult.isValid, 'telephone is valid');
      assert.notOk(validationResult.errors);

      model.telephone = '+32123456789';
      validationResult = await validateRecord(model, validationSchema);
      assert.true(validationResult.isValid, 'telephone is valid');
      assert.notOk(validationResult.errors);
    });

    test('website', async function (assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('contact-point', {
        name: CONTACT_DATA_TYPE.WEBSITE,
      });

      let validationResult = await validateRecord(model, validationSchema);
      assert.false(
        validationResult.isValid,
        "website is required when it's a contact point of type website",
      );
      assert.strictEqual(Object.keys(validationResult.errors).length, 1);
      assert.ok(validationResult.errors.website);

      model.website = 'abcd';
      validationResult = await validateRecord(model, validationSchema);
      assert.false(validationResult.isValid, 'must be a valid url');
      assert.strictEqual(Object.keys(validationResult.errors).length, 1);
      assert.ok(validationResult.errors.website);

      model.website = 'website.be';
      validationResult = await validateRecord(model, validationSchema);
      assert.false(validationResult.isValid, 'must be a valid url');
      assert.strictEqual(Object.keys(validationResult.errors).length, 1);
      assert.ok(validationResult.errors.website);

      model.website = 'https://vlaanderen.be';
      validationResult = await validateRecord(model, validationSchema);
      assert.true(validationResult.isValid, 'website is valid');
      assert.notOk(validationResult.errors);

      model.website = 'http://vlaanderen.be';
      validationResult = await validateRecord(model, validationSchema);
      assert.true(validationResult.isValid, 'website is valid');
      assert.notOk(validationResult.errors);
    });

    test('social media', async function (assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('contact-point', {
        name: CONTACT_DATA_TYPE.SOCIAL_MEDIA,
      });

      let validationResult = await validateRecord(model, validationSchema);
      assert.false(
        validationResult.isValid,
        "website is required when it's a contact point of type social media",
      );
      assert.strictEqual(Object.keys(validationResult.errors).length, 1);
      assert.ok(validationResult.errors.website);

      model.website = 'abcd';
      validationResult = await validateRecord(model, validationSchema);
      assert.false(validationResult.isValid, 'must be a valid url');
      assert.strictEqual(Object.keys(validationResult.errors).length, 1);
      assert.ok(validationResult.errors.website);

      model.website = 'website.be';
      validationResult = await validateRecord(model, validationSchema);
      assert.false(validationResult.isValid, 'must be a valid url');
      assert.strictEqual(Object.keys(validationResult.errors).length, 1);
      assert.ok(validationResult.errors.website);

      model.website = 'https://vlaanderen.be';
      validationResult = await validateRecord(model, validationSchema);
      assert.true(validationResult.isValid, 'website is valid');
      assert.notOk(validationResult.errors);

      model.website = 'http://vlaanderen.be';
      validationResult = await validateRecord(model, validationSchema);
      assert.true(validationResult.isValid, 'website is valid');
      assert.notOk(validationResult.errors);
    });
  });
});
