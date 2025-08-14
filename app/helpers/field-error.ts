/**
 * Simple helper that returns the error message of the first error.
 * EmberData's .errors property always returns an array, but we only ever set a single error message.
 */

type Errors = {
  message: string;
}[];

export default function fieldError(errors?: Errors) {
  if (Array.isArray(errors)) {
    return errors.at(0)?.message;
  }
}
