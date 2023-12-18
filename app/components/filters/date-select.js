import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class DateSelectFilterComponent extends Component {
  @service router;
  @service store;

  @tracked start = '';
  @tracked end = '';

  @tracked dates;

  constructor() {
    super(...arguments);
    this.start = this.router.currentRoute.queryParams.start;
    this.end = this.router.currentRoute.queryParams.end;

    this.loadDates();
  }

  selectedDates() {
    if (this.start && this.end) {
      return this.findDateByValue({ start: this.start, end: this.end });
    }
    return '';
  }

  findDateByValue(value) {
    return this.dates.find(
      (date) =>
        date.value.start === value.start && date.value.end === value.end,
    );
  }

  loadDates() {
    const year = new Date().getFullYear();

    this.dates = [
      {
        label: `oktober-december ${year}`,
        value: { start: `${year}-10-01`, end: `${year}-12-31` },
      },
      {
        label: `juli-september ${year}`,
        value: { start: `${year}-07-01`, end: `${year}-09-30` },
      },
      {
        label: `april-juni ${year}`,
        value: { start: `${year}-04-01`, end: `${year}-06-30` },
      },
      {
        label: `januari-maart ${year}`,
        value: { start: `${year}-01-01`, end: `${year}-03-31` },
      },
      {
        label: `${year - 1}`,
        value: { start: `${year - 1}-01-01`, end: `${year - 1}-12-31` },
      },
      {
        label: `${year - 2}`,
        value: { start: `${year - 2}-01-01`, end: `${year - 2}-12-31` },
      },
    ];

    this.args.onChange(this.selectedDates());
  }
}
