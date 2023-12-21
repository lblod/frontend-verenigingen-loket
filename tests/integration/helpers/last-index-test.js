import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-verenigingen-loket/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | last-index', function (hooks) {
  setupRenderingTest(hooks);

  // TODO: Replace this with your real tests.
  test('it renders', async function (assert) {
    this.set('inputValue', ['1', '2', '3', '4']);

    await render(hbs`
    {{#each this.inputValue as |value index|}}
      {{#if
        (last-index index this.inputValue)
      }}
        {{ value }}
      {{/if}}
    {{/each}}
  `);

    assert.dom().hasAnyText('4');
  });
});
