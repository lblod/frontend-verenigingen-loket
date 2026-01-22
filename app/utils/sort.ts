/**
 * Sorts an array in-place based on a given property name.
 *
 * @param array Sorts the given array based on the given property name
 * @param sortString name of the property which should be used to sort
 */
export type PropertyMap<T> = {
  [sortKey: string]: keyof T;
};

export function sortByProperty<T>(
  array: T[],
  sortString: string,
  propertyMap?: PropertyMap<T>,
): void {
  const sortProperty = sortString.startsWith('-')
    ? sortString.slice(1)
    : sortString;
  const descending = sortString.startsWith('-');
  const property = propertyMap?.[sortProperty] ?? (sortProperty as keyof T);

  array.sort((a, b) => {
    const valueA = a[property];
    const valueB = b[property];

    // We group "undefined" values together, similar to how the sorting works in mu-cl-resources
    if (valueA === undefined || valueA === null) {
      return descending ? -1 : 1;
    }

    if (valueB === undefined || valueB === null) {
      return descending ? 1 : -1;
    }

    // Handle string comparison with locale-aware sorting
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      const comparison = valueA.localeCompare(valueB, undefined, {
        sensitivity: 'base', // Case-insensitive comparison
      });
      return descending ? -comparison : comparison;
    }

    // Default comparison for non-string values
    if (valueA < valueB) {
      return descending ? 1 : -1;
    }

    if (valueA > valueB) {
      return descending ? -1 : 1;
    }

    return 0;
  });
}
