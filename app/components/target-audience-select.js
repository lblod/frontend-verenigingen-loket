import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class TargetAudienceSelectComponent extends Component {
  @service router;
  @service store;

  @tracked targetAudienceQuery = '';

  constructor() {
    super(...arguments);
    this.targetAudienceQuery =
      this.router.currentRoute.queryParams.targetAudiences;
    this.loadTargetAudience.perform();
  }

  selectedTargetAudience() {
    return this.targetAudienceQuery.split(',');
  }

  @task
  *loadTargetAudience() {
    this.args.onChange(this.selectedTargetAudience());
  }
}
