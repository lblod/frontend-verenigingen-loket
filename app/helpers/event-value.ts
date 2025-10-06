export default function eventValue(
  handler: (value: string) => unknown,
  options: {
    trim?: boolean;
  } = {},
) {
  return function (event: Event) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    let value = target.value;

    if (options.trim) {
      value = value.trim();
    }

    return handler(value);
  };
}
