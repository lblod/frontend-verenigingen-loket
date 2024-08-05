export default function isPeriodExpired(period) {
  return Boolean(period?.endTime) && new Date(period.endTime) < new Date();
}
