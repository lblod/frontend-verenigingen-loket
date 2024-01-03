import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-verenigingen-loket/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | date-format', function (hooks) {
  setupRenderingTest(hooks);

  test('it should return a valid date', async function (assert) {
    this.set('inputValue', '2023-12-06');

    await render(hbs`{{date-format this.inputValue}}`);

    assert.dom().hasText('06-12-2023');
  });

  test('it should return null', async function (assert) {
    this.set('inputValue', 'blabla');

    await render(hbs`{{date-format this.inputValue}}`);

    assert.dom().doesNotContainText();
  });
});
