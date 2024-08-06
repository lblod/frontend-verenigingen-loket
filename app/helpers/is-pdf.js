import { helper } from '@ember/component/helper';

export default helper(function isPdf(fileName) {
  const pdfRegex = /\.pdf$/;
  return pdfRegex.test(fileName);
});
