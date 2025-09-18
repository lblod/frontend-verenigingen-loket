import { isValidRijksregisternummer } from 'frontend-verenigingen-loket/utils/rijksregisternummer';
import { module, test } from 'qunit';

module('Unit | Utility | rijksregisternummer', function () {
  test('isValidRijksregisternummer', function (assert) {
    assert.false(isValidRijksregisternummer(''), 'empty string');
    assert.false(isValidRijksregisternummer('1234'), 'too short');
    assert.false(isValidRijksregisternummer('12345678910'), 'invalid checksum');

    assert.true(
      isValidRijksregisternummer('02031200518'),
      'man born on 12/3/2002',
    );
    assert.false(
      isValidRijksregisternummer('02031200519'),
      'man born on 12/3/2002 but the checksum is wrong',
    );
    assert.true(
      isValidRijksregisternummer('95082000687'),
      'woman born on 20/8/1995',
    );
    assert.false(
      isValidRijksregisternummer('95082000686'),
      'woman born on 20/8/1995 but the checksum is wrong',
    );
  });
});
