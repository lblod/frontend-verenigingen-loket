import { helper } from '@ember/component/helper';

export default helper(function DateYear([date]) {
  const newDate = new Date(date);
  return newDate.getFullYear();
});
