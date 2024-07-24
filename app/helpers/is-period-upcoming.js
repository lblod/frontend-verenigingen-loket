export default function isPeriodUpcoming(period) {
  return Boolean(period?.startTime) && new Date(period.startTime) > new Date();
}
