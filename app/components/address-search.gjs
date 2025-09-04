// Based on the component in OP: https://github.com/lblod/frontend-organization-portal/blob/7e709b6edd2d5d738f85ef35f4d01755c2f9da85/app/components/address-search.js
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { hash } from '@ember/helper';
import { service } from '@ember/service';
import { restartableTask, task, timeout } from 'ember-concurrency';
import PowerSelect from 'ember-power-select/components/power-select';

export default class AddressSearch extends Component {
  @service addressRegister;

  @tracked selectedAddress;
  @tracked addressWithBusNumber;
  @tracked addressesWithBusNumbers;

  get shouldShowBusNumberSelector() {
    return Boolean(this.addressesWithBusNumbers);
  }

  get isBusNumberSelectionDisabled() {
    return !this.addressWithBusNumber;
  }

  get showBusNumbersNotAvailableMessage() {
    return Boolean(this.selectedAddress) && !this.addressWithBusNumber;
  }

  handleAddressChange = (data) => {
    const addresses = data?.addresses;
    const source = data?.source;

    this.selectedAddress = null;
    this.addressWithBusNumber = null;
    this.addressesWithBusNumbers = null;
    this.resetAddressAttributes();

    if (addresses) {
      let hasBusNumberData = addresses.length > 1;
      let firstAddress = addresses[0];
      this.selectedAddress = firstAddress;

      if (hasBusNumberData) {
        this.addressesWithBusNumbers = addresses;
        this.handleBusNumberChange(firstAddress);
      } else {
        this.updateAddressAttributes(firstAddress, source);
      }
    }
  };

  handleBusNumberChange = (address) => {
    this.addressWithBusNumber = address;
    this.updateAddressAttributes(address);
  };

  updateAddressAttributes(newAddressValues, source) {
    const address = nullToUndefined(newAddressValues);
    Object.assign(this.args.address, {
      street: address.street,
      number: address.housenumber,
      boxNumber: address.busNumber,
      postcode: address.zipCode,
      fullAddress: address.fullAddress,
      source,
      municipality: address.municipality,
      country: address.country,
      addressRegisterUri: address.uri,
    });
  }

  resetAddressAttributes() {
    Object.assign(this.args.address, {
      street: undefined,
      number: undefined,
      boxNumber: undefined,
      postcode: undefined,
      fullAddress: undefined,
      source: undefined,
      municipality: undefined,
      country: undefined,
      addressRegisterUri: undefined,
    });
  }

  <template>
    {{yield
      (hash
        Search=(component
          AddressRegisterSelector
          address=@address
          onChange=this.handleAddressChange
          error=@errorMessage
        )
        BusNumber=(component
          AddressRegisterBusNumberSelector
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

class AddressRegisterSelector extends Component {
  @service addressRegister;
  @service store;

  @tracked addressSuggestion;

  constructor() {
    super(...arguments);

    this.addressRegister.setup({ endpoint: '/address-register' });
    if (this.args.address) {
      let addressSuggestion = this.args.address;

      if (!this.addressRegister.isEmpty(addressSuggestion)) {
        this.addressSuggestion = addressSuggestion;
      }
    }
  }

  selectSuggestion = task(async (addressSuggestion) => {
    this.args.onChange(null); // Why do we call this?
    this.addressSuggestion = addressSuggestion;

    if (addressSuggestion) {
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
    }
  });

  search = restartableTask(async (searchData) => {
    await timeout(400);
    const addressSuggestions = await this.addressRegister.suggest(searchData);
    return addressSuggestions;
  });

  maybePrefillSearch = (selectApi) => {
    if (this.addressSuggestion) {
      selectApi.actions.search(this.addressSuggestion.fullAddress);
    }
  };

  <template>
    <div class={{if @error "ember-power-select--error"}}>
      <PowerSelect
        @width="block"
        @triggerId={{@id}}
        @allowClear={{true}}
        @renderInPlace={{false}}
        @search={{this.search.perform}}
        @selected={{this.addressSuggestion}}
        @options={{this.addressSuggestion}}
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

const AddressRegisterBusNumberSelector = <template>
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
</template>;

// Converts properties set to null to undefined instead, which simplifies the validations
function nullToUndefined(object) {
  return Object.fromEntries(
    Object.entries(object).map(([key, value]) => [
      key,
      value === null ? undefined : value,
    ]),
  );
}
