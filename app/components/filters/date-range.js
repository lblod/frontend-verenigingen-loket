import { action } from '@ember/object';
import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';

export default class DateRangeFilter extends Component {
  @tracked start;
  @tracked end;
  @tracked selectedPreset = null;
  @tracked isChoosingPresets = true;
  @tracked endDateError = [];

  constructor(owner, args) {
    super(owner, args);

    const { start, end } = this.args;
    this.start = start ? start : null;
    this.end = end ? end : null;
    this.findInitialDatePreset();
  }

  @cached
  get presets() {
    const year = new Date().getFullYear();
    return [
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
  }

  get hasBothDates() {
    return Boolean(this.start) && Boolean(this.end);
  }

  get hasNoDates() {
    return !this.start && !this.end;
  }

  get isInvalidDateRange() {
    return this.hasBothDates && new Date(this.start) > new Date(this.end);
  }

  @action handleSelectionChange(selectedPreset) {
    this.selectedPreset = selectedPreset;

    if (selectedPreset) {
      const { start, end } = selectedPreset.value;
      this.start = start;
      this.end = end;
      this.triggerOnChange();
    } else {
      this.resetDates();
    }
  }

  @action handleStartDateChange(newDate) {
    this.start = newDate;

    if (this.isDateComplete(newDate)) {
      this.triggerOnChangeIfValid();
    }
  }

  @action handleEndDateChange(newDate) {
    this.end = newDate;

    if (this.isDateComplete(newDate)) {
      this.triggerOnChangeIfValid();
    }
  }

  isDateComplete(date) {
    return date === null || date.length === 10;
  }

  @action chooseCustomRange() {
    this.isChoosingPresets = false;
    this.selectedPreset = null;
  }

  @action choosePresets() {
    this.isChoosingPresets = true;

    if (this.hasNoDates) {
      return;
    }

    const maybePreset = this.findDatePreset(this.start, this.end);
    if (maybePreset) {
      this.selectedPreset = maybePreset;
    } else {
      // If the dates don't match a preset we clear the dates. Otherwise the UI would show an empty select while
      // there is still a date filter applied in the background.
      this.resetDates();
    }
  }

  findInitialDatePreset() {
    if (this.hasNoDates) {
      return;
    }

    const maybePreset = this.findDatePreset(this.start, this.end);
    if (maybePreset) {
      this.selectedPreset = maybePreset;
    } else {
      // The dates don't match a preset, so we switch to the custom date inputs instead
      this.isChoosingPresets = false;
    }
  }

  findDatePreset(start, end) {
    const NO_PRESET = null;

    const couldMatchPreset = start && end;
    if (couldMatchPreset) {
      const maybePreset = this.presets.find((preset) => {
        return start === preset.value.start && end === preset.value.end;
      });

      return maybePreset ? maybePreset : NO_PRESET;
    } else {
      return NO_PRESET;
    }
  }

  triggerOnChangeIfValid() {
    if (this.isInvalidDateRange) {
      this.endDateError = ['De startdatum moet voor de einddatum liggen'];
    } else {
      this.triggerOnChange();
    }
  }

  resetDates() {
    this.start = null;
    this.end = null;
    this.triggerOnChange();
  }

  triggerOnChange() {
    this.args.onChange?.(this.start, this.end);
  }
}
