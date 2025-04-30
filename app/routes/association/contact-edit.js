import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class AssociationContactEditRoute extends Route {
  @service currentSession;
  @service contactPoints;
  @service router;
  @service store;

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('association.contact-detail');
    }
  }

  async model() {
    return {
      task: this.loadData.perform(),
    };
  }

  loadData = task({ keepLatest: true }, async () => {
    const { id } = this.paramsFor('association');
    const include = ['contact-points', 'primary-site.address'].join(',');
    const query = {
      include,
    };

    const association = await this.store.findRecord('association', id, query);
    const contactPoints = await association.contactPoints;
    const primarySite = await association.primarySite;
    const address = await primarySite.address;

    return {
      association,
      contactPoints,
      address,
      contactDetails: this.contactPoints.getDetails(contactPoints)
    };
  });
}

class FormState {
  data = {};
  validationSchema = {};
  errors = {};

  constructor(data, validationSchema) {
    this.data = data;
    this.validationSchema = this.validationSchema;
  }

  validate() {
    // validate the data according to the validationSchema
    // update errors when needed
  }

  addError(property, error) {
    // Todo, add
  }

  clearError(property) {
    // todo
  }
}
