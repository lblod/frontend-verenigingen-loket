import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-verenigingen-loket/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | organization-status-select',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await render(hbs`<OrganizationStatusSelect />`);

      assert.dom().hasText('');

      // Template block usage:
      await render(hbs`
      <OrganizationStatusSelect>
        template block text
      </OrganizationStatusSelect>
    `);

      assert.dom().hasText('template block text');
    });
  },
);
