import { helper } from '@ember/component/helper';

export default helper(function DateFormat([date]) {
  if (!isNaN(new Date(date))) {
    const newDate = new Date(date);
    const day = newDate.toLocaleDateString('nl-BE', { day: '2-digit' }),
      month = newDate.toLocaleDateString('nl-BE', { month: '2-digit' }),
      year = newDate.getFullYear();

    return day + '-' + month + '-' + year;
  }
  return null;
});
