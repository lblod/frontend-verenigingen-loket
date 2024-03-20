import { helper } from '@ember/component/helper';

const DAYS_BEFORE = 14; // 2 weeks

export default helper(function isNewAssociation(params) {
  const [association] = params;

  const startDate = new Date(association.createdOn);
  const today = new Date();
  const daysBeforeToday = today.setDate(today.getDate() - DAYS_BEFORE);

  return startDate > daysBeforeToday;
});
