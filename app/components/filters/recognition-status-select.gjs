import Component from '@glimmer/component';
import {
  RECOGNITION_STATUS,
  labelForRecognitionStatus
} from '../../models/recognition';
import AuFieldset from '@appuniversum/ember-appuniversum/components/au-fieldset';
import AuCheckboxGroup from '@appuniversum/ember-appuniversum/components/au-checkbox-group';

export default class RecognitionStatusSelect extends Component {
  get options() {
    return Object.values(RECOGNITION_STATUS);
  }

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
              {{labelForRecognitionStatus option}}
            </Group.Checkbox>
          {{/each}}
        </AuCheckboxGroup>
      </f.content>
    </AuFieldset>
  </template>
}
