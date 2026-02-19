import { module, test } from 'qunit';
import { setupTest } from 'frontend-verenigingen-loket/tests/helpers';
import type Association from 'frontend-verenigingen-loket/models/association';
import type Concept from 'frontend-verenigingen-loket/models/concept';

module('Unit | Service | sensitive-data', function (hooks) {
  setupTest(hooks);

  test('it works', function (assert) {
    const sensitiveData = this.owner.lookup('service:sensitive-data');
    const store = this.owner.lookup('service:store');
    const associationA = store.createRecord<Association>('association', {});
    const associationB = store.createRecord<Association>('association', {});
    const reasonConcept = store.createRecord<Concept>('concept', {});

    assert.false(sensitiveData.hasProvidedReason(associationA));
    assert.true(sensitiveData.requiresReason(associationA));
    assert.false(sensitiveData.hasProvidedReason(associationB));
    assert.true(sensitiveData.requiresReason(associationB));

    sensitiveData.provideReason(associationA, reasonConcept);
    assert.true(sensitiveData.hasProvidedReason(associationA));
    assert.false(
      sensitiveData.hasProvidedReason(associationB),
      'associationB is unaffected by the provided reason for associationA',
    );

    assert.throws(() => {
      sensitiveData.getReason(associationB);
    }, 'it throws an error if `getReason` is used before a reason was provided');

    assert.strictEqual(sensitiveData.getReason(associationA), reasonConcept);
  });
});
