import Component from '@glimmer/component';
import {
  RECOGNITION_STATUS_LABELS,
  RECOGNITION_STATUS,
} from '../../models/recognition';
import AuFieldset from '@appuniversum/ember-appuniversum/components/au-fieldset';
import AuCheckboxGroup from '@appuniversum/ember-appuniversum/components/au-checkbox-group';

export default class RecognitionStatusSelect extends Component {
  get options() {
    return Object.values(RECOGNITION_STATUS);
  }

  optionLabel = (uri) => {
    return RECOGNITION_STATUS_LABELS[uri];
  };

  <template>
    <AuFieldset class="au-u-margin-top" as |f|>
      <f.legend>
        Erkenning
      </f.legend>
      <f.content>
        <AuCheckboxGroup
          @name="recognition-status-filter"
          @selected={{@selected}}
          @onChange={{@onChange}}
          as |Group|
        >
          {{#each this.options as |option|}}
            <Group.Checkbox @value={{option}}>
              {{this.optionLabel option}}
            </Group.Checkbox>
          {{/each}}
        </AuCheckboxGroup>
      </f.content>
    </AuFieldset>
  </template>
}
