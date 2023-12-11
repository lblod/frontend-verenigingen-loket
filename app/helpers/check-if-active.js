import { helper } from '@ember/component/helper';

function checkIfActive([startDate, endDate]) {
  const currentDate = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  return currentDate >= start && currentDate <= end;
}

export default helper(checkIfActive);
