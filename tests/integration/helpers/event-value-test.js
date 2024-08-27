import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { fillIn, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | event-value', function (hooks) {
  setupRenderingTest(hooks);

  test('it calls the handler with the event value', async function (assert) {
    this.handler = (value) => {
      assert.step(value);
    };

    await render(hbs`
      <label>
        <input {{on "change" (event-value this.handler)}} />
      </label>
    `);

    await fillIn('input', 'foo');
    assert.verifySteps(['foo']);
  });

  test('it works with fn + mut', async function (assert) {
    await render(hbs`
      <label>
        <input {{on "change" (event-value (fn (mut this.value)))}} />
      </label>
    `);

    assert.strictEqual(this.value, undefined);
    await fillIn('input', 'foo');
    assert.strictEqual(this.value, 'foo');
  });
});
