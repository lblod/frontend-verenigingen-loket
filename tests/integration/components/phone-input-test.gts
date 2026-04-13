import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-verenigingen-loket/tests/helpers';
import { render, settled } from '@ember/test-helpers';
import PhoneInput from 'frontend-verenigingen-loket/components/phone-input';
import { trackedObject } from '@ember/reactive/collections';

module('Integration | Component | phone-input', function (hooks) {
  setupRenderingTest(hooks);

  test('it can display a warning message if the phone number is potentially invalid', async function (assert) {
    const state = trackedObject<{ value: string | undefined }>();
    await render(
      <template>
        <PhoneInput @value={{state.value}} as |phone|>
          {{#if phone.warning}}
            <div data-warning-message>{{phone.warning}}</div>
          {{/if}}
        </PhoneInput>
      </template>,
    );

    assert
      .dom('[data-warning-message]')
      .doesNotExist('not providing a value should not display a warning');

    state.value = '';
    await settled();
    assert
      .dom('[data-warning-message]')
      .doesNotExist('providing an empty string should not display a warning');

    state.value = '1234';
    await settled();
    assert
      .dom('[data-warning-message]')
      .exists()
      .containsText('Dit telefoonnummer lijkt ongebruikelijk kort.');

    state.value = '1234567890123';
    await settled();
    assert
      .dom('[data-warning-message]')
      .exists()
      .containsText('Dit telefoonnummer lijkt ongebruikelijk lang.');

    state.value = '0411223344';
    await settled();
    assert
      .dom('[data-warning-message]')
      .exists()
      .containsText('Gebruik bij voorkeur de internationale notatie.');

    state.value = '+32411223344';
    await settled();
    assert
      .dom('[data-warning-message]')
      .doesNotExist(
        'international notation numbers should not display a warning',
      );

    state.value = '+32 411 22 33 44';
    await settled();
    assert
      .dom('[data-warning-message]')
      .doesNotExist(
        'white space should be ignored when checking the length of a number',
      );
  });
});
