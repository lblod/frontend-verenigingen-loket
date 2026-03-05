// Based on the component in OP: https://github.com/lblod/frontend-organization-portal/blob/7e709b6edd2d5d738f85ef35f4d01755c2f9da85/app/components/address-search.js
import type { TOC } from '@ember/component/template-only';
import { assert } from '@ember/debug';
import { hash } from '@ember/helper';
import type Owner from '@ember/owner';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type { WithBoundArgs } from '@glint/template';
import type AddressRegisterService from '@lblod/ember-address-search/services/address-register';
import type { Address } from '@lblod/ember-address-search/services/address-register';
import { restartableTask, task, timeout } from 'ember-concurrency';
import PowerSelect, {
  type Select,
} from 'ember-power-select/components/power-select';
import type StoreService from 'frontend-verenigingen-loket/services/store';
import type TrackedData from 'frontend-verenigingen-loket/utils/tracked-data';
import type {
  Adres,
  AdresIdentifier,
} from 'frontend-verenigingen-loket/utils/verenigingsregister';
import {
  clearAdresValues,
  isEmptyAdres,
} from 'frontend-verenigingen-loket/utils/verenigingsregister/adres';

interface AddressSearchSignature {
  Args: {
    adres: TrackedData<Partial<Adres & AdresIdentifier>>;
    errorMessage?: string;
  };
  Blocks: {
    default: [
      {
        Search: WithBoundArgs<
          typeof AddressRegisterSelector,
          'adres' | 'onChange' | 'error'
        >;
        BusNumber: WithBoundArgs<
          typeof BusNumberSelector,
          'address' | 'options' | 'onChange' | 'disabled' | 'placeholder'
        >;
        shouldSelectBusNumber: boolean;
      },
    ];
  };
}

export default class AddressSearch extends Component<AddressSearchSignature> {
  @service declare addressRegister: AddressRegisterService;

  @tracked selectedAddress?: Address;
  @tracked addressWithBusNumber?: Address;
  @tracked addressesWithBusNumbers?: Address[];

  get shouldShowBusNumberSelector() {
    return Boolean(this.addressesWithBusNumbers);
  }

  get isBusNumberSelectionDisabled() {
    return !this.addressWithBusNumber;
  }

  get showBusNumbersNotAvailableMessage() {
    return Boolean(this.selectedAddress) && !this.addressWithBusNumber;
  }

  handleAddressChange = (data: { addresses: Address[] } | null) => {
    const addresses = data?.addresses;

    this.selectedAddress = undefined;
    this.addressWithBusNumber = undefined;
    this.addressesWithBusNumbers = undefined;
    this.resetAddressAttributes();

    if (addresses) {
      const shouldSelectBusNumber = addresses.length > 1;
      const firstAddress = addresses[0];

      assert('firstAddress is expected to be set', firstAddress);
      this.selectedAddress = firstAddress;

      if (shouldSelectBusNumber) {
        this.addressesWithBusNumbers = addresses;
        this.handleBusNumberChange(firstAddress);
      } else {
        this.updateAddressAttributes(firstAddress);
      }
    }
  };

  handleBusNumberChange = (address: Address) => {
    this.addressWithBusNumber = address;
    this.updateAddressAttributes(address);
  };

  updateAddressAttributes(newAddressValues: Address) {
    const address = nullToUndefined(newAddressValues) as Address;

    const adres = this.args.adres.data;
    adres.straatnaam = address.street;
    adres.huisnummer = address.housenumber;
    adres.busnummer = address.busNumber;
    adres.postcode = address.zipCode;
    adres.gemeente = address.municipality;
    adres.land = address.country;
    adres.bronwaarde = address.uri;
  }

  resetAddressAttributes() {
    clearAdresValues(this.args.adres.data);
  }

  <template>
    {{yield
      (hash
        Search=(component
          AddressRegisterSelector
          adres=@adres
          onChange=this.handleAddressChange
          error=(if @errorMessage true false)
        )
        BusNumber=(component
          BusNumberSelector
          address=this.addressWithBusNumber
          options=this.addressesWithBusNumbers
          onChange=this.handleBusNumberChange
          disabled=this.isBusNumberSelectionDisabled
          placeholder=(if
            this.showBusNumbersNotAvailableMessage "Geen busnummer beschikbaar"
          )
        )
        shouldSelectBusNumber=this.shouldShowBusNumberSelector
      )
    }}
  </template>
}

interface AddressRegisterSelectorSignature {
  Args: {
    adres: TrackedData<Partial<Adres & AdresIdentifier>>;
    error?: boolean;
    id?: string;
    onChange: (data: { addresses: Address[] } | null) => void;
  };
}

class AddressRegisterSelector extends Component<AddressRegisterSelectorSignature> {
  @service declare addressRegister: AddressRegisterService;
  @service declare store: StoreService;

  @tracked addressSuggestion: Address | undefined;

  constructor(owner: Owner, args: AddressRegisterSelectorSignature['Args']) {
    super(owner, args);

    this.addressRegister.setup({ endpoint: '/address-register' });
    const adres = this.args.adres;
    if (adres && !isEmptyAdres(adres.data)) {
      const addressSuggestion = adresToAddress(adres.data);

      this.addressSuggestion = addressSuggestion as Address;
    }
  }

  selectSuggestion = task(async (addressSuggestion: Address | null) => {
    if (addressSuggestion) {
      this.addressSuggestion = addressSuggestion;
      const addresses = await this.addressRegister.findAll(addressSuggestion);

      // TODO: this should probably be fixed in the API itself (, if possible)
      // avoid duplicates, e.g Liebaardstnaat 10, 8792 Waregem
      this.args.onChange({
        addresses: [
          ...new Map(
            addresses.map((a) => [
              `${a.street}${a.housenumber}${a.busNumber}`,
              a,
            ]),
          ).values(),
        ],
      });
    } else {
      this.addressSuggestion = undefined;
      this.args.onChange(null);
    }
  });

  search = restartableTask(async (searchData: string) => {
    await timeout(400);
    const addressSuggestions = await this.addressRegister.suggest(searchData);
    return addressSuggestions;
  });

  maybePrefillSearch = (selectApi: Select) => {
    if (this.addressSuggestion) {
      selectApi.actions.search(this.addressSuggestion.fullAddress);
    }
  };

  <template>
    <div class={{if @error "ember-power-select--error"}}>
      <PowerSelect
        @triggerId={{@id}}
        @allowClear={{true}}
        @renderInPlace={{false}}
        @search={{this.search.perform}}
        @selected={{this.addressSuggestion}}
        @onChange={{this.selectSuggestion.perform}}
        @loadingMessage="Aan het laden..."
        @searchEnabled={{true}}
        @noMatchesMessage="Geen resultaten"
        @searchMessage="Typ om te zoeken"
        @onOpen={{this.maybePrefillSearch}}
        as |suggestion|
      >
        {{suggestion.fullAddress}}
      </PowerSelect>
    </div>
  </template>
}

interface BusNumberSelectorSignature {
  Args: {
    address?: Address;
    options: Address[];
    disabled?: boolean;
    placeholder?: string;
    onChange: (value: Address) => void;
  };
}
const BusNumberSelector = <template>
  <PowerSelect
    @disabled={{@disabled}}
    @searchEnabled={{true}}
    @searchField="busNumber"
    @placeholder={{@placeholder}}
    @selected={{@address}}
    @renderInPlace={{false}}
    @options={{@options}}
    @onChange={{@onChange}}
    @loadingMessage="Aan het laden..."
    as |address|
  >
    {{#if address.busNumber}}
      Bus
      {{address.busNumber}}
    {{else}}
      Geen busnummer
    {{/if}}
  </PowerSelect>
</template> satisfies TOC<BusNumberSelectorSignature>;

// Converts properties set to null to undefined instead, which simplifies the validations
function nullToUndefined(object: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(object).map(([key, value]) => [
      key,
      value === null ? undefined : value,
    ]),
  );
}

function adresToAddress(adres: Partial<Adres>): Partial<Address> {
  return {
    street: adres.straatnaam,
    housenumber: adres.huisnummer,
    busNumber: adres.busnummer,
    zipCode: adres.postcode,
    municipality: adres.gemeente,
    country: adres.land,
    fullAddress: adresToFullAddress(adres as Adres),
  };
}

function adresToFullAddress(adres: Adres): string {
  return `${adres.straatnaam} ${adres.huisnummer}${adres.busnummer ? ' ' + adres.busnummer : ''}, ${adres.postcode} ${adres.gemeente}, ${adres.land}`;
}
