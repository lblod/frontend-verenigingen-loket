import { module, test } from 'qunit';
import { setupTest } from 'frontend-verenigingen-loket/tests/helpers';

module('Unit | Route |  general', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route: general');
    assert.ok(route);
  });
});
