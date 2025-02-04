export default function dateFormat(date, format = 'DD-MM-YYYY') {
  const newDate = new Date(date);

  if (!isNaN(newDate)) {
    const day = newDate.toLocaleDateString('nl-BE', { day: '2-digit' }),
      month = newDate.toLocaleDateString('nl-BE', { month: '2-digit' }),
      year = newDate.getFullYear();

    if (format === 'YYY-MM-DD') {
      return year + '-' + month + '-' + day;
    }
    return day + '-' + month + '-' + year;
  }
  return null;
}
