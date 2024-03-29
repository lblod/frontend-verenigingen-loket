import { helper } from '@ember/component/helper';

export default helper(function convertToDate(dateString) {
  return new Date(dateString);
});
