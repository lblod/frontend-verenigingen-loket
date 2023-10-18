import { module, test } from 'qunit';

import { setupTest } from 'frontend-verenigingen-loket/tests/helpers';

module('Unit | Model | site', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('site', {});
    assert.ok(model);
  });
});
