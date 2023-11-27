import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class ReportWrongDataComponent extends Component {
  @service store;
  @service router;
  @tracked contactEmail = '';
  @tracked vCode = '';
  association = this.args.model;

  constructor() {
    super(...arguments);
    this.loadAssociationData.perform();
  }

  @task
  *loadAssociationData() {
    if (this.args.model != null) {
      try {
        const contactPoints = yield this.association.get('contactPoints');
        const identifiers = yield this.association.get('identifiers');
        if (identifiers) {
          this.association.identifiers.forEach(async (identifier) => {
            const { idName } = identifier;
            const structuredIdentifier = await identifier.get(
              'structuredIdentifier',
            );
            if (idName === 'vCode') {
              this.vCode = structuredIdentifier.localId;
            }
          });
        }
        if (contactPoints) {
          contactPoints.forEach((contact) => {
            const { email } = contact;
            if (email) {
              this.contactEmail = email;
            }
          });
        }
      } catch (error) {
        console.error('Error loading contact email:', error);
      }
    }
  }

  get subject() {
    return 'Je verenigingsgegevens zijn niet volledig of foutief';
  }
  get body() {
    const url = encodeURIComponent('https://www.verenigingsloket.be/');
    return `Vereniging: ${
      this.association ? this.association.name : ''
    } %0D%0A vCode: ${
      this.vCode
    } %0D%0A Aan te passen op het ${url} (Verenigingsloket), pagina 'Mijn gegevens'.`;
  }
}
