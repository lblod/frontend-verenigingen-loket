import Component from '@glimmer/component';
import { service } from '@ember/service';
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

  loadAssociationData = task({ drop: true }, async () => {
    if (this.args.model != null) {
      try {
        const contactPoints = await this.association.get('contactPoints');
        const identifiers = await this.association.get('identifiers');
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
  });

  get subject() {
    return 'Je verenigingsgegevens zijn niet volledig of foutief';
  }
  get body() {
    const url = encodeURIComponent('https://www.verenigingsloket.be/');
    return `Vereniging: ${
      this.association ? this.association.name : ''
    } %0D%0AvCode: ${
      this.vCode
    } %0D%0AAan te passen op het ${url} (Verenigingsloket), pagina 'Mijn gegevens'.
      %0D%0A----------------------
      %0D%0ABegin hier te typen:
      %0D%0A
    `;
  }
}
