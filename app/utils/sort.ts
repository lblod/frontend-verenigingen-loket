/**
 * Sorts an array in-place based on one or more property names.
 *
 * @param array Sorts the given array based on the given property name(s)
 * @param sortString name(s) of the property/properties which should be used to sort. Multiple properties can be separated by commas.
 * @example sortByProperty(people, 'lastName') - sorts by lastName ascending
 * @example sortByProperty(people, '-age') - sorts by age descending
 * @example sortByProperty(people, 'lastName,firstName') - sorts by lastName ascending, then firstName ascending
 * @example sortByProperty(people, '-lastName,firstName') - sorts by lastName descending, then firstName ascending
 */

const LESS_THAN = -1;
const EQUAL = 0;
const GREATER_THAN = 1;

export type PropertyMap<T> = {
  [sortKey: string]: keyof T;
};

export function sortByProperty<T>(
  array: T[],
  sortString: string,
  propertyMap?: PropertyMap<T>,
): void {
  const sortValues = parseSortValues<T>(sortString, propertyMap);

  array.sort((a, b) => {
    for (const { property, isDescending } of sortValues) {
      const valueA = a[property];
      const valueB = b[property];

      // We group "undefined" values together, similar to how the sorting works in mu-cl-resources
      if (valueA === undefined || valueA === null) {
        if (valueB === undefined || valueB === null) {
          // Both undefined/null, continue to next property
          continue;
        }
        return isDescending ? LESS_THAN : GREATER_THAN;
      }

      if (valueB === undefined || valueB === null) {
        return isDescending ? GREATER_THAN : LESS_THAN;
      }

      let comparison = EQUAL;

      if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
        // Handle boolean comparison - true values come first in ascending order
        if (valueA === valueB) {
          comparison = EQUAL;
        } else {
          comparison = valueA === true ? LESS_THAN : GREATER_THAN;
        }
      } else if (typeof valueA === 'string' && typeof valueB === 'string') {
        // Handle string comparison with locale-aware sorting
        comparison = valueA.localeCompare(valueB, undefined, {
          sensitivity: 'base', // Case-insensitive comparison
        });
      } else {
        // Default comparison for non-string values
        if (valueA < valueB) {
          comparison = LESS_THAN;
        } else if (valueA > valueB) {
          comparison = GREATER_THAN;
        } else {
          comparison = EQUAL;
        }
      }

      if (comparison !== EQUAL) {
        return isDescending ? -comparison : comparison;
      }
    }

    return EQUAL;
  });
}

function parseSortValues<T>(
  sortString: string,
  propertyMap: PropertyMap<T> | undefined,
) {
  return sortString.split(',').map((untrimmed) => {
    const sortString = untrimmed.trim();
    const isDescending = sortString.startsWith('-');
    const propertyName = isDescending ? sortString.slice(1) : sortString;
    const resolvedProperty =
      propertyMap?.[propertyName] ?? (propertyName as keyof T);

    return {
      property: resolvedProperty,
      isDescending: isDescending,
    };
  });
}
