import { assert } from '@ember/debug';
import { tracked } from '@glimmer/tracking';

// Inlined from the tracked-toolbox package since it's a simple util, and we don't need to add an extra dependency this way.
// Source: https://github.com/tracked-tools/tracked-toolbox/blob/861bad8d5f91066436e074d6b56cc9c96fc03b99/tracked-toolbox/src/index.js#L148
// TODO: replace this with the actual package once we start using more utils.
export function dedupeTracked() {
  let comparator;
  const descriptor = function (target, key, desc) {
    let { initializer } = desc;
    let { get, set } = tracked(target, key, desc);

    let values = new WeakMap();

    return {
      get() {
        if (!values.has(this)) {
          let value = initializer?.call(this);
          values.set(this, value);
          set.call(this, value);
        }

        return get.call(this);
      },

      set(value) {
        if (!values.has(this) || !comparator(value, values.get(this))) {
          values.set(this, value);
          set.call(this, value);
        }
      },
    };
  };
  if (arguments.length === 3) {
    comparator = (a, b) => a === b;
    return descriptor(...arguments);
  }
  if (arguments.length === 1 && typeof arguments[0] === 'function') {
    comparator = arguments[0];
    return descriptor;
  }
  assert(
    `@dedupeTracked() can either be invoked without arguments or with one comparator function, received \`${String(
      arguments,
    )}\``,
    false,
  );
}
