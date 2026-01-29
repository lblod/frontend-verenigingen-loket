import { render, settled } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import TrackedData from 'frontend-verenigingen-loket/utils/tracked-data';

module('Integration | Utility | tracked-data', function (hooks) {
  setupRenderingTest(hooks);

  interface Person {
    givenName?: string;
    familyName?: string;
  }

  test('it rerenders when data changes', async function (assert) {
    const person = new TrackedData<Person>({
      givenName: 'John',
      familyName: 'Doe',
    });

    await render(
      <template>
        <div data-test-person-name>{{person.data.givenName}}</div>
        <div data-test-person-family>{{person.data.familyName}}</div>
      </template>,
    );

    assert
      .dom('[data-test-person-name]')
      .hasText('John', 'Initial givenName is rendered');
    assert
      .dom('[data-test-person-family]')
      .hasText('Doe', 'Initial familyName is rendered');

    person.data.givenName = 'Jane';
    person.data.familyName = 'Smith';

    await settled();

    assert
      .dom('[data-test-person-name]')
      .hasText('Jane', 'Updated givenName is rendered');
    assert
      .dom('[data-test-person-family]')
      .hasText('Smith', 'Updated familyName is rendered');
  });

  test('it rerenders when errors change', async function (assert) {
    const person = new TrackedData<Person>({
      givenName: 'John',
      familyName: 'Doe',
    });

    await render(
      <template>
        {{#if person.errors.givenName}}
          <div data-test-error>
            Error:
            {{person.errors.givenName}}
          </div>
        {{/if}}
      </template>,
    );

    assert.dom('[data-test-error]').doesNotExist('No error initially');

    person.addError('givenName', 'Invalid characters!');
    await settled();

    assert
      .dom('[data-test-error]')
      .hasText('Error: Invalid characters!', 'Error is rendered');

    person.removeError('givenName');
    await settled();

    assert.dom('[data-test-error]').doesNotExist('Error is removed');

    person.addError('givenName', 'Invalid characters!');
    await settled();

    assert.dom('[data-test-error]').exists();

    person.data.givenName = 'Jane';
    await settled();

    assert.dom('[data-test-error]').doesNotExist('Error is removed');
  });

  test('it rerenders when changes are accepted', async function (assert) {
    const person = new TrackedData<Person>({
      givenName: 'John',
      familyName: 'Doe',
    });

    await render(
      <template>
        <div data-test-has-changes>{{if
            person.hasChanges
            "Has changes"
            "No changes"
          }}</div>
      </template>,
    );

    assert
      .dom('[data-test-has-changes]')
      .hasText('No changes', 'No changes initially');

    person.data.givenName = 'Jane';
    await settled();

    assert
      .dom('[data-test-has-changes]')
      .hasText('Has changes', 'Changes are detected');

    person.acceptChanges();
    await settled();

    assert
      .dom('[data-test-has-changes]')
      .hasText('No changes', 'Changes are cleared');
  });
});
