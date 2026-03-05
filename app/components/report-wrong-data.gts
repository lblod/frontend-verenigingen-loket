import AuHelpText, {
  type AuHelpTextSignature,
} from '@appuniversum/ember-appuniversum/components/au-help-text';
import AuLinkExternal from '@appuniversum/ember-appuniversum/components/au-link-external';
import type Owner from '@ember/owner';
import type RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type Association from 'frontend-verenigingen-loket/models/association';
import type Store from 'frontend-verenigingen-loket/services/store';

interface ReportWrongDataSignature {
  Args: {
    model?: Association;
  };
  Element: AuHelpTextSignature['Element'];
}
export default class ReportWrongData extends Component<ReportWrongDataSignature> {
  @service declare store: Store;
  @service declare router: RouterService;

  @tracked contactEmail = '';
  @tracked vCode = '';

  constructor(owner: Owner, args: ReportWrongDataSignature['Args']) {
    super(owner, args);
    void this.loadAssociationData.perform();
  }
  get association() {
    return this.args.model;
  }

  loadAssociationData = task({ drop: true }, async () => {
    if (this.association != null) {
      try {
        const contactPoints = await this.association.contactPoints;
        const identifiers = await this.association.identifiers;

        if (identifiers) {
          for (const identifier of identifiers) {
            const { idName } = identifier;
            const structuredIdentifier = await identifier.structuredIdentifier;
            if (idName === 'vCode') {
              this.vCode = structuredIdentifier.localId;
              break;
            }
          }
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

  <template>
    {{#if this.contactEmail}}
      <AuHelpText ...attributes>
        Zie je een fout in de data?
        <br />
        <AuLinkExternal
          href="
            mailto:{{this.contactEmail}}
            ?subject={{this.subject}}
            &body={{this.body}}"
        >
          Meld het bij de vereniging!
        </AuLinkExternal>
      </AuHelpText>
    {{/if}}
  </template>
}
