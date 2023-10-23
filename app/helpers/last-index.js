import { helper } from '@ember/component/helper';

export function lastIndex(params) {
  const [index, array] = params;
  return index === array.length - 1;
}

export default helper(lastIndex);
