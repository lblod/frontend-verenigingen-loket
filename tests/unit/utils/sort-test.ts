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

  test('sorts by multiple properties in ascending order', function (assert) {
    const people = [
      { lastName: 'Smith', firstName: 'Charlie' },
      { lastName: 'Smith', firstName: 'Alice' },
      { lastName: 'Doe', firstName: 'Bob' },
      { lastName: 'Doe', firstName: 'Alice' },
    ];

    sortByProperty(people, 'lastName,firstName');

    assert.deepEqual(
      people,
      [
        { lastName: 'Doe', firstName: 'Alice' },
        { lastName: 'Doe', firstName: 'Bob' },
        { lastName: 'Smith', firstName: 'Alice' },
        { lastName: 'Smith', firstName: 'Charlie' },
      ],
      'Array is sorted by lastName, then firstName in ascending order',
    );
  });

  test('sorts by multiple properties with mixed directions', function (assert) {
    const people = [
      { lastName: 'Smith', age: 30 },
      { lastName: 'Smith', age: 25 },
      { lastName: 'Doe', age: 35 },
      { lastName: 'Doe', age: 25 },
    ];

    sortByProperty(people, 'lastName,-age');

    assert.deepEqual(
      people,
      [
        { lastName: 'Doe', age: 35 },
        { lastName: 'Doe', age: 25 },
        { lastName: 'Smith', age: 30 },
        { lastName: 'Smith', age: 25 },
      ],
      'Array is sorted by lastName ascending, then age descending',
    );
  });

  test('sorts by multiple properties with whitespace in sort string', function (assert) {
    const people = [
      { lastName: 'Smith', firstName: 'Charlie' },
      { lastName: 'Smith', firstName: 'Alice' },
      { lastName: 'Doe', firstName: 'Bob' },
    ];

    sortByProperty(people, 'lastName, firstName');

    assert.deepEqual(
      people,
      [
        { lastName: 'Doe', firstName: 'Bob' },
        { lastName: 'Smith', firstName: 'Alice' },
        { lastName: 'Smith', firstName: 'Charlie' },
      ],
      'Array is sorted correctly with whitespace in sort string',
    );
  });

  test('sorts by multiple properties with undefined values', function (assert) {
    const people = [
      { lastName: 'Smith', firstName: 'Charlie' },
      { lastName: 'Smith', firstName: undefined },
      { lastName: 'Doe', firstName: 'Alice' },
      { lastName: 'Doe', firstName: undefined },
    ];

    sortByProperty(people, 'lastName,firstName');

    // First sorted by lastName, then undefined firstNames should be at the end of each lastName group
    assert.strictEqual(people[0]?.lastName, 'Doe');
    assert.strictEqual(people[0]?.firstName, 'Alice');
    assert.strictEqual(people[1]?.lastName, 'Doe');
    assert.strictEqual(people[1]?.firstName, undefined);
    assert.strictEqual(people[2]?.lastName, 'Smith');
    assert.strictEqual(people[2]?.firstName, 'Charlie');
    assert.strictEqual(people[3]?.lastName, 'Smith');
    assert.strictEqual(people[3]?.firstName, undefined);
  });

  test('sorts by multiple properties with descending and undefined values', function (assert) {
    const people = [
      { lastName: 'Smith', age: 30 },
      { lastName: 'Smith', age: undefined },
      { lastName: 'Doe', age: 35 },
      { lastName: 'Doe', age: undefined },
    ];

    sortByProperty(people, '-lastName,-age');

    // Sorted by lastName descending, then age descending
    // For descending, undefined values should come first
    assert.strictEqual(people[0]?.lastName, 'Smith');
    assert.strictEqual(people[0]?.age, undefined);
    assert.strictEqual(people[1]?.lastName, 'Smith');
    assert.strictEqual(people[1]?.age, 30);
    assert.strictEqual(people[2]?.lastName, 'Doe');
    assert.strictEqual(people[2]?.age, undefined);
    assert.strictEqual(people[3]?.lastName, 'Doe');
    assert.strictEqual(people[3]?.age, 35);
  });

  test('sorts by three properties', function (assert) {
    const people = [
      { country: 'USA', lastName: 'Smith', firstName: 'Charlie' },
      { country: 'USA', lastName: 'Smith', firstName: 'Alice' },
      { country: 'USA', lastName: 'Doe', firstName: 'Bob' },
      { country: 'UK', lastName: 'Smith', firstName: 'Alice' },
      { country: 'UK', lastName: 'Smith', firstName: 'Zoe' },
    ];

    sortByProperty(people, 'country,lastName,firstName');

    assert.deepEqual(
      people,
      [
        { country: 'UK', lastName: 'Smith', firstName: 'Alice' },
        { country: 'UK', lastName: 'Smith', firstName: 'Zoe' },
        { country: 'USA', lastName: 'Doe', firstName: 'Bob' },
        { country: 'USA', lastName: 'Smith', firstName: 'Alice' },
        { country: 'USA', lastName: 'Smith', firstName: 'Charlie' },
      ],
      'Array is sorted by three properties correctly',
    );
  });

  test('sorts by boolean property in ascending order (true first)', function (assert) {
    const items = [
      { name: 'Item A', active: false },
      { name: 'Item B', active: true },
      { name: 'Item C', active: false },
      { name: 'Item D', active: true },
    ];

    sortByProperty(items, 'active');

    assert.deepEqual(
      items,
      [
        { name: 'Item B', active: true },
        { name: 'Item D', active: true },
        { name: 'Item A', active: false },
        { name: 'Item C', active: false },
      ],
      'Array is sorted by boolean with true values first',
    );
  });

  test('sorts by boolean property in descending order (false first)', function (assert) {
    const items = [
      { name: 'Item A', active: false },
      { name: 'Item B', active: true },
      { name: 'Item C', active: false },
      { name: 'Item D', active: true },
    ];

    sortByProperty(items, '-active');

    assert.deepEqual(
      items,
      [
        { name: 'Item A', active: false },
        { name: 'Item C', active: false },
        { name: 'Item B', active: true },
        { name: 'Item D', active: true },
      ],
      'Array is sorted by boolean with false values first',
    );
  });

  test('sorts by multiple properties including boolean', function (assert) {
    let items = [
      { category: 'A', active: false },
      { category: 'A', active: true },
      { category: 'B', active: false },
      { category: 'B', active: true },
    ];

    sortByProperty(items, 'category,active');

    assert.deepEqual(
      items,
      [
        { category: 'A', active: true },
        { category: 'A', active: false },
        { category: 'B', active: true },
        { category: 'B', active: false },
      ],
      'Array is sorted by category, then by boolean with true first',
    );

    items = [
      { category: 'A', active: false },
      { category: 'B', active: true },
      { category: 'B', active: false },
      { category: 'A', active: true },
    ];

    sortByProperty(items, 'active,category');
    assert.deepEqual(
      items,
      [
        { category: 'A', active: true },
        { category: 'B', active: true },
        { category: 'A', active: false },
        { category: 'B', active: false },
      ],
      'Array is sorted by boolean with true first, then by category',
    );
  });
});
