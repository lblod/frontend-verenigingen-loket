import Component from '@glimmer/component';
import EditCard from './edit-card';
import type Concept from 'frontend-verenigingen-loket/models/concept';
import { service } from '@ember/service';
import type Store from 'frontend-verenigingen-loket/services/store';
import type Owner from '@ember/owner';
import { CONCEPT_SCHEME } from 'frontend-verenigingen-loket/models/concept';
import PowerSelect from 'ember-power-select/components/power-select';
import type { TOC } from '@ember/component/template-only';

interface ReasonFormSignature {
  Args: {
    reason?: Concept;
    onReasonChange: (reason: Concept) => void;
  };
  Element: HTMLFormElement;
}

const ReasonForm = <template>
  <form ...attributes>
    <EditCard @containsRequiredFields={{true}}>
      <:card as |Card|>
        <Card.Columns>
          <:left as |Item|>
            <Item @labelFor="reason" @required={{true}}>
              <:label>Reden</:label>
              <:content as |id|>
                <ReasonSelect
                  @id={{id}}
                  @reason={{@reason}}
                  @onChange={{@onReasonChange}}
                />
              </:content>
            </Item>
          </:left>
        </Card.Columns>
      </:card>
    </EditCard>
  </form>
</template> satisfies TOC<ReasonFormSignature>;

export default ReasonForm;

interface ReasonSelectSignature {
  Args: {
    reason?: Concept;
    id?: string;
    onChange: (reason: Concept) => void;
  };
}

class ReasonSelect extends Component<ReasonSelectSignature> {
  @service declare store: Store;

  requestPromise?: Promise<Concept[]>;

  constructor(owner: Owner, args: ReasonSelectSignature['Args']) {
    super(owner, args);

    this.requestPromise = this.store.query<Concept>('concept', {
      'filter[concept-scheme][:id:]': CONCEPT_SCHEME.REASON_CODES,
    });
  }

  <template>
    <PowerSelect
      @searchEnabled={{false}}
      @loadingMessage="Aan het laden..."
      @selected={{@reason}}
      @options={{this.requestPromise}}
      @onChange={{@onChange}}
      @triggerId={{@id}}
      as |reasonCode|
    >
      {{reasonCode.prefLabel}}
    </PowerSelect>
  </template>
}
