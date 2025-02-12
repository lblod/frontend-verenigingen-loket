export default function dateYear(date) {
  const newDate = new Date(date);
  return newDate.getFullYear();
}
