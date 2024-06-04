const NR_WITH_COUNTRY = /^(?:\+|00)(\d\d)(\d{8,12})$/;
const NR_WITHOUT_COUNTRY = /^0(\d{8,11})$/;
const SHORT_NR = /^\d{4}$/;
const FREE_NR = /^0800(\d{4,9})$/;
const NON_NUMERIC_CHARACTER = /[^\d+]/g;

/**
 * Formats a series of digits into groups of two, separated by spaces.
 * Used for formatting the rest of a free number.
 * @param {string} digits - A string representing the series of digits.
 * @returns {string} Formatted string with digits grouped in twos.
 */
export function formatSeriesDigitsFree(digits) {
  // Throw an error if there are less than 4 digits
  if (digits.length < 4)
    throw new Error('Stopping because of fewer than 4 numbers');

  let input = digits;
  const output = [];

  // Group the digits in pairs until there are less than 3 remaining
  while (input.length > 3) {
    output.push(input.slice(0, 2));
    input = input.slice(2);
  }
  // Push the remaining digits (less than 3) to the output array
  output.push(input.slice(0));

  return output.join(' ');
}

/**
 * Formats a series of digits into groups of two or three, separated by spaces.
 * Used for formatting the rest of a normal number.
 * @param {string} digits - A string representing the series of digits.
 * @returns {string} Formatted string with digits grouped in twos or threes.
 */
export function formatSeriesDigitsNormal(digits) {
  // Throw an error if there are less than 4 digits
  if (digits.length < 4)
    throw new Error('Stopping because of fewer than 4 numbers');

  let input = digits;
  const output = [];

  // Take the first chunk of 3 or 2 digits
  if (digits.length % 2 === 0) {
    output.push(input.slice(0, 2));
    input = input.slice(2);
  } else {
    output.push(input.slice(0, 3));
    input = input.slice(3);
  }

  // Take the remaining digits in chunks of 2
  while (input.length > 0) {
    output.push(input.slice(0, 2));
    input = input.slice(2);
  }

  return output.join(' ');
}

/**
 * Formats telephone numbers according to predefined patterns.
 * @param {string} args - The telephone number to format.
 * @returns {string} Formatted telephone number.
 * @throws {Error} If the input is not a string or does not match any pattern.
 */
export default function formatTel(...args) {
  if (args.length !== 1) throw new Error('Exactly 1 parameter expected');

  const input = args[0];

  // If input is empty, return an empty string
  if (input === '') return '';

  // Check if the input is a string, if not, throw an error
  if (typeof input !== 'string') throw new Error('Parameter must be a string');

  // Remove non-numeric characters from the input
  const stripped = input.replace(NON_NUMERIC_CHARACTER, '');

  // Check if the input matches a short number pattern, return it if it does
  if (SHORT_NR.test(stripped)) return stripped;

  // Check if the input matches a free number pattern
  if (FREE_NR.test(stripped)) {
    // If it does, extract the rest of the number and format it with formatSeriesDigitsFree
    const match = stripped.match(FREE_NR);
    const rest = match[1];
    return `0800 ${formatSeriesDigitsFree(rest)}`;
  }

  // If it's not a short number or a free number, determine if it's a number with or without country code
  const { country, rest } = (() => {
    const match1 = stripped.match(NR_WITH_COUNTRY);
    if (match1) {
      return {
        country: match1[1],
        rest: match1[2],
      };
    }
    const match2 = stripped.match(NR_WITHOUT_COUNTRY);
    if (match2) {
      return {
        country: '32',
        rest: match2[1],
      };
    } else {
      return {
        country: '',
        rest: '',
      };
    }
  })();

  // Format the number based on whether it has a country code and return it
  return country ? `+${country} ${formatSeriesDigitsNormal(rest)}` : stripped;
}
