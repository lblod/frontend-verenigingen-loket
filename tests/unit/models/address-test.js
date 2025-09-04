import { setupTest } from 'frontend-verenigingen-loket/tests/helpers';
import { module, test } from 'qunit';
import { isEmptyAddress } from 'frontend-verenigingen-loket/models/address';

module('Unit | Model | address', function (hooks) {
  setupTest(hooks);

  test('isEmptyAddress', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('address', {});

    assert.true(isEmptyAddress(model));

    Object.assign(model, {
      number: null,
      boxNumber: null,
      street: null,
      postcode: null,
      municipality: null,
      province: null,
      country: null,
      fullAddress: null,
      addressRegisterUri: null,
    });
    assert.true(isEmptyAddress(model), 'null is considered empty');

    model.number = '12';
    assert.false(
      isEmptyAddress(model),
      'it returns false when at least one attribute has a value',
    );
  });
});
