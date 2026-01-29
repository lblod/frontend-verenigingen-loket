import { module, test } from 'qunit';
import TrackedData from 'frontend-verenigingen-loket/utils/tracked-data';

module('Unit | Utilities | tracked-data', function () {
  interface Person {
    givenName?: string;
    familyName?: string;
  }

  test('initial state', function (assert) {
    const person = new TrackedData<Person>({
      givenName: 'John',
      familyName: 'Doe',
    });

    assert.equal(person.data.givenName, 'John', 'Initial givenName is set');
    assert.equal(person.data.familyName, 'Doe', 'Initial familyName is set');
    assert.ok(person.isNew, 'isNew defaults to true');
    assert.deepEqual(person.changedValues, [], 'No changes initially');
    assert.notOk(person.hasChanges, 'No changes initially');
  });

  test('change tracking', function (assert) {
    const person = new TrackedData<Person>({
      givenName: 'John',
      familyName: 'Doe',
    });

    person.data.givenName = 'Jane';
    assert.deepEqual(
      person.changedValues,
      ['givenName'],
      'Tracks changed property',
    );
    assert.ok(person.hasChanges, 'hasChanges is true after modification');

    person.data.familyName = 'Smith';
    assert.deepEqual(
      person.changedValues,
      ['givenName', 'familyName'],
      'Tracks multiple changes',
    );

    person.data.givenName = 'John';
    assert.deepEqual(
      person.changedValues,
      ['familyName'],
      'Reverts to original values remove it from the changedValues list',
    );

    person.data.familyName = 'Doe';
    assert.deepEqual(
      person.changedValues,
      [],
      'Reverts to original values remove it from the changedValues list',
    );
    assert.notOk(
      person.hasChanges,
      'hasChanges is false when all properties are returned to their original value',
    );
  });

  test('error management', function (assert) {
    const person = new TrackedData<Person>({
      givenName: 'John',
      familyName: 'Doe',
    });

    person.addError('givenName', 'Required');
    assert.equal(
      person.errors.givenName,
      'Required',
      'Sets error for property',
    );

    person.addError('givenName', 'Invalid');
    assert.equal(
      person.errors.givenName,
      'Invalid',
      'Overwrites existing error',
    );

    person.removeError('givenName');
    assert.notOk(person.hasError('givenName'), 'Removes error for property');

    person.addError('givenName', 'Another error');
    person.clearErrors();
    assert.notOk(person.hasError('givenName'), 'Clears all errors');
  });

  test('acceptChanges resets baseline', function (assert) {
    const person = new TrackedData<Person>({
      givenName: 'John',
      familyName: 'Doe',
    });

    person.data.givenName = 'Jane';
    person.data.familyName = 'Smith';
    assert.ok(person.hasChanges, 'Changes are tracked');
    assert.ok(person.isNew);

    person.acceptChanges();
    assert.notOk(person.hasChanges, 'Changes are cleared after acceptChanges');
    assert.deepEqual(
      person.changedValues,
      [],
      'changedValues is empty after acceptChanges',
    );
    assert.notOk(
      person.isNew,
      'after accepting changes the changes, the instance is no longer considered new either',
    );
  });

  test('revertChanges resets any changes back to baseline', function (assert) {
    const person = new TrackedData<Person>({
      givenName: 'John',
      familyName: 'Doe',
    });

    person.data.givenName = 'Jane';
    person.data.familyName = 'Smith';
    assert.ok(person.hasChanges, 'Changes are tracked');

    person.revertChanges();
    assert.notOk(person.hasChanges, 'Changes are cleared after revertChanges');
    assert.deepEqual(
      person.changedValues,
      [],
      'changedValues is empty after revertChanges',
    );
    assert.equal(
      person.data.givenName,
      'John',
      'givenName is reverted to the initial value',
    );
    assert.equal(
      person.data.familyName,
      'Doe',
      'familyName is reverted to the initial value',
    );
  });

  test('revertChanges after acceptChanges resets any changes back to the new baseline', function (assert) {
    const person = new TrackedData<Person>({
      givenName: 'John',
      familyName: 'Doe',
    });

    person.data.givenName = 'Jane';
    person.data.familyName = 'Smith';
    assert.ok(person.hasChanges, 'Changes are tracked');

    person.acceptChanges();
    assert.notOk(person.hasChanges, 'Changes are cleared after acceptChanges');

    person.data.givenName = 'Jiminy';
    person.data.familyName = 'Cricket';
    assert.ok(person.hasChanges);

    person.revertChanges();
    assert.notOk(person.hasChanges, 'Changes are cleared after revertChanges');

    assert.equal(
      person.data.givenName,
      'Jane',
      'givenName is reverted to the new baseline value',
    );
    assert.equal(
      person.data.familyName,
      'Smith',
      'familyName is reverted to the new baseline value',
    );
  });

  test('isNew flag respects options', function (assert) {
    const person1 = new TrackedData<Person>({
      givenName: 'John',
      familyName: 'Doe',
    });
    assert.ok(person1.isNew, 'isNew defaults to true');

    const person2 = new TrackedData<Person>(
      { givenName: 'John', familyName: 'Doe' },
      { isNew: false },
    );
    assert.notOk(person2.isNew, 'isNew is false when explicitly set');
  });
});
