import AuInput, {
  type AuInputSignature,
} from '@appuniversum/ember-appuniversum/components/au-input';
import type { TOC } from '@ember/component/template-only';
import { hash } from '@ember/helper';
import { on } from '@ember/modifier';
import Component from '@glimmer/component';
import type { WithBoundArgs } from '@glint/template';
import { modifier } from 'ember-modifier';
import Inputmask from 'inputmask';

const SHORT_BE_NUMBER_LENGTH = 9; // Belgian landline numbers are at least 9 digits long
const LONG_INTL_NUMBER_LENGTH = 12; // Mobile phone numbers in international notation are 12 characters, including the +

interface PhoneInputSignature {
  Args: {
    value?: string;
    onUpdate?: (value: string) => void;
  };
  Blocks: {
    default: [
      {
        Input: WithBoundArgs<typeof Input, 'value' | 'warning' | 'onUpdate'>;
        warning: string | undefined;
      },
    ];
  };
}

export default class PhoneInput extends Component<PhoneInputSignature> {
  get warningMessage() {
    const phone = this.args.value;

    if (!phone) {
      return undefined;
    }

    if (phone.length < SHORT_BE_NUMBER_LENGTH) {
      return 'Dit telefoonnummer lijkt ongebruikelijk kort. Controleer of het correct is ingevuld.';
    }

    if (phone.length > LONG_INTL_NUMBER_LENGTH) {
      return 'Dit telefoonnummer lijkt ongebruikelijk lang. Controleer of het correct is ingevuld.';
    }

    if (!isInternationalNumber(phone)) {
      return 'Gebruik bij voorkeur de internationale notatie.';
    }

    return undefined;
  }

  get warning() {
    return Boolean(this.warningMessage);
  }

  onUpdate = (event: Event) => {
    if (event.target instanceof HTMLInputElement) {
      this.args.onUpdate?.(event.target.value);
    }
  };

  <template>
    {{yield
      (hash
        Input=(component
          Input value=@value warning=this.warning onUpdate=this.onUpdate
        )
        warning=this.warningMessage
      )
    }}
  </template>
}

function isInternationalNumber(phone: string) {
  const BASIC_INTL_FORMAT_REGEX = /\+\d*/;
  return BASIC_INTL_FORMAT_REGEX.test(phone);
}

const phoneInputMask = modifier(function (element: HTMLInputElement) {
  new Inputmask({
    regex: '^\\+?\\d*',
    placeholder: '',
  }).mask(element);

  return () => {
    element.inputmask?.remove();
  };
});

interface InputSignature {
  Args: AuInputSignature['Args'] & {
    value: string;
    onUpdate: (event: Event) => void;
  };
  Element: AuInputSignature['Element'];
}

const Input = <template>
  <AuInput
    @disabled={{@disabled}}
    @error={{@error}}
    @warning={{@warning}}
    @width={{@width}}
    type="tel"
    value={{@value}}
    {{on "focusout" @onUpdate}}
    {{phoneInputMask}}
    ...attributes
  />
</template> satisfies TOC<InputSignature>;
