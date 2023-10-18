import { module, test } from 'qunit';
import { setupTest } from 'frontend-verenigingen-loket/tests/helpers';

module('Unit | Route |  contact-details', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route: contact-details');
    assert.ok(route);
  });
});
