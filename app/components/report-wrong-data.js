import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class ReportWrongDataComponent extends Component {
  @service store;
  @service router;
  @tracked contactEmail = '';
  @tracked association = this.args.model;
  @tracked vCode = '';

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
    return `Wij hebben vastgesteld dat de gegevens van je vereniging niet volledig of foutief zijn.%0D%0A Je vereniging: ${
      this.association ? this.association.name : ''
    } %0D%0A Je vCode: ${
      this.vCode
    } %0D%0A Wil je je aanmelden op het ${url} (Verenigingsloket) en naar de pagina 'Mijn gegevens' surfen om je gegevens bij te werken? Dan beschikt iedereen over correcte en volledige gegevens en kunnen we fouten en misverstanden vermijden.%0D%0A %0D%0A Alvast hartelijk dank,`;
  }
}
