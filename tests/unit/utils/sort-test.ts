import { module, test } from 'qunit';
import { sortByProperty } from 'frontend-verenigingen-loket/utils/sort';
import type { PropertyMap } from 'frontend-verenigingen-loket/utils/sort';

module('Unit | Utility | sort-by-property', function () {
  test('sorts array by property in ascending order', function (assert) {
    const people = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
      { name: 'Charlie', age: 35 },
    ];

    sortByProperty(people, 'age');

    assert.deepEqual(
      people,
      [
        { name: 'Bob', age: 25 },
        { name: 'Alice', age: 30 },
        { name: 'Charlie', age: 35 },
      ],
      'Array is sorted by age in ascending order',
    );
  });

  test('sorts array by property in descending order', function (assert) {
    const people = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
      { name: 'Charlie', age: 35 },
    ];

    sortByProperty(people, '-age');

    assert.deepEqual(
      people,
      [
        { name: 'Charlie', age: 35 },
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ],
      'Array is sorted by age in descending order',
    );
  });

  test('groups undefined values at the end for ascending order', function (assert) {
    const people = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: undefined },
      { name: 'Charlie', age: 35 },
      { name: 'Dave', age: undefined },
    ];

    sortByProperty(people, 'age');

    // Check that defined values come first, and undefined values are grouped
    assert.notStrictEqual(
      people[0]?.age,
      undefined,
      'First element is defined',
    );
    assert.notStrictEqual(
      people[1]?.age,
      undefined,
      'Second element is defined',
    );
    assert.strictEqual(people[2]?.age, undefined, 'Third element is undefined');
    assert.strictEqual(
      people[3]?.age,
      undefined,
      'Fourth element is undefined',
    );
  });

  test('groups undefined values at the beginning for descending order', function (assert) {
    const people = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: undefined },
      { name: 'Charlie', age: 35 },
      { name: 'Dave', age: undefined },
    ];

    sortByProperty(people, '-age');

    // Check that undefined values come first, and defined values are grouped
    assert.strictEqual(people[0]?.age, undefined, 'First element is undefined');
    assert.strictEqual(
      people[1]?.age,
      undefined,
      'Second element is undefined',
    );
    assert.notStrictEqual(
      people[2]?.age,
      undefined,
      'Third element is defined',
    );
    assert.notStrictEqual(
      people[3]?.age,
      undefined,
      'Fourth element is defined',
    );
  });

  test('sorts using a property map for nested properties', function (assert) {
    const people = [
      { name: 'Alice', socialMedia: 'https://alice.com' },
      { name: 'Bob' },
      { name: 'Charlie', socialMedia: 'https://charlie.com' },
    ];

    // It seems we explicitly need to type the propertyMap to make TS happy?
    const propertyMap: PropertyMap<{ name: string; socialMedia?: string }> = {
      'social-media': 'socialMedia',
    };
    sortByProperty(people, 'social-media', propertyMap);

    // Check that the array is sorted by the nested property
    assert.strictEqual(people[0]?.socialMedia, 'https://alice.com');
    assert.strictEqual(people[1]?.socialMedia, 'https://charlie.com');
    assert.strictEqual(people[2]?.socialMedia, undefined);
  });

  test('handles empty array', function (assert) {
    const people: Array<{ name: string; age?: number }> = [];

    sortByProperty(people, 'age');

    assert.deepEqual(people, [], 'Empty array remains unchanged');
  });
});
