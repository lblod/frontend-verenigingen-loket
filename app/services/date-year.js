import Service from '@ember/service';

export default class DateYearService extends Service {
  getCurrentYear(date) {
    const newDate = new Date(date);
    return newDate.getFullYear();
  }
}
