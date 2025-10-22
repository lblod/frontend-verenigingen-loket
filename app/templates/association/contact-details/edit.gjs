/* eslint-disable ember/no-empty-glimmer-component-classes */
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuCheckbox from '@appuniversum/ember-appuniversum/components/au-checkbox';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuHelpText from '@appuniversum/ember-appuniversum/components/au-help-text';
import AuInput from '@appuniversum/ember-appuniversum/components/au-input';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { pageTitle } from 'ember-page-title';
import PowerSelect from 'ember-power-select/components/power-select';
import AddressSearch from 'frontend-verenigingen-loket/components/address-search';
import CountrySelect from 'frontend-verenigingen-loket/components/address/country-select';
import MunicipalitySelectByName from 'frontend-verenigingen-loket/components/address/municipality-select-by-name';
import EditCard from 'frontend-verenigingen-loket/components/edit-card';
import PhoneInput from 'frontend-verenigingen-loket/components/phone-input';
import EditTable, {
  EditCell,
} from 'frontend-verenigingen-loket/components/edit-table';
import eventValue from 'frontend-verenigingen-loket/helpers/event-value';
import {
  BELGIUM,
  clearAddress,
  isPostcodeInFlanders,
  isEmptyAddress,
  validationSchema as addressValidationSchema,
} from 'frontend-verenigingen-loket/models/address';
import {
  CONTACT_DATA_TYPE,
  CONTACT_POINT_LABEL,
  isPrimaryContactPoint,
  setPrimaryContactPoint,
  unsetPrimaryContactPoint,
  validationSchema as contactPointValidationSchema,
} from 'frontend-verenigingen-loket/models/contact-point';
import { removeItem } from 'frontend-verenigingen-loket/utils/array';
import {
  createOrUpdateContactDetail,
  removeContactDetail,
  createOrUpdateCorrespondenceSite,
  removeCorrespondenceSite,
  handleError,
  waitForStableAPI,
} from 'frontend-verenigingen-loket/utils/verenigingsregister';
import { validateRecord } from 'frontend-verenigingen-loket/validations/validate-record';

export default class ContactEdit extends Component {
  @service router;
  @service store;
  @service toaster;
  contactPointsToRemove = [];

  get isLoading() {
    // We use the controller's model to work around an Ember bug: https://github.com/emberjs/ember.js/issues/18987
    return this.args.controller.model.task.isRunning;
  }

  get taskData() {
    // We use the controller's model to work around an Ember bug: https://github.com/emberjs/ember.js/issues/18987
    return this.args.controller.model.task.isFinished
      ? this.args.controller.model.task.value
      : null;
  }

  get association() {
    return this.taskData?.association;
  }

  get contactPoints() {
    return this.taskData?.contactPoints;
  }

  get correspondenceAddressSite() {
    return this.taskData?.correspondenceAddressSite;
  }

  get correspondenceAddress() {
    return this.taskData?.correspondenceAddress;
  }

  save = dropTask(async (event) => {
    event.preventDefault();

    const promises = this.contactPoints.map(async (contactPoint) => {
      await validateRecord(contactPoint, contactPointValidationSchema);

      return contactPoint.isValid;
    });

    const isValid = (await Promise.all(promises)).every((isValid) =>
      Boolean(isValid),
    );

    if (!isValid) {
      return;
    }

    const address = this.correspondenceAddress;
    const shouldValidateAddress =
      !isEmptyAddress(address) && !address.addressRegisterUri;

    if (shouldValidateAddress) {
      await validateRecord(address, addressValidationSchema);

      if (!address.isValid) {
        return;
      }
    }

    try {
      for (const contactPoint of this.contactPointsToRemove) {
        await removeContactDetail(contactPoint);
      }
      this.contactPointsToRemove = [];

      const contactPointsToSave = this.contactPoints.filter(
        (contactPoint) => contactPoint.hasDirtyAttributes,
      );

      for (const contactPoint of contactPointsToSave) {
        await createOrUpdateContactDetail(contactPoint);
      }

      const association = this.association;
      const site = this.correspondenceAddressSite;

      // We only check the address for changes, since site details can't be changed on this page
      if (address.hasDirtyAttributes) {
        if (isEmptyAddress(address)) {
          if (!site.isNew) {
            await removeCorrespondenceSite(site, association);
          }
        } else {
          await createOrUpdateCorrespondenceSite(site, association);
        }
      }

      await waitForStableAPI();
      this.router.transitionTo('association.contact-details');
    } catch (error) {
      handleError(this.toaster, error);
    }
  });

  handlePrimaryChange = (contactPoint) => {
    const isCurrentPrimary = isPrimaryContactPoint(contactPoint);

    if (isCurrentPrimary) {
      unsetPrimaryContactPoint(contactPoint);
    } else {
      // This contact point isn't the primary yet, but there can only be one primary per type.
      // We need to find the previous primary contact point of the same type and unset it.
      this.contactPoints.some((cp) => {
        if (cp.name === contactPoint.name && isPrimaryContactPoint(cp)) {
          unsetPrimaryContactPoint(cp);
          return true;
        }
      });
      setPrimaryContactPoint(contactPoint);
    }
  };

  deleteContactPoint = (contactPoint) => {
    removeItem(this.contactPoints, contactPoint);

    if (contactPoint.isNew) {
      // If the contact point is new, we can remove it from the store
      contactPoint.rollbackAttributes();
    } else {
      // If the contact point is not new, we need to mark it for deletion
      this.contactPointsToRemove.push(contactPoint);
    }
  };

  addNewContactPoint = () => {
    const newContactPoint = this.store.createRecord('contact-point', {
      organization: this.association,
    });

    this.contactPoints.push(newContactPoint);
  };

  reset() {
    this.contactPointsToRemove.forEach((contactPoint) => {
      contactPoint.rollbackAttributes();
    });
    this.contactPointsToRemove = [];
    this.contactPoints.forEach((contactPoint) => {
      contactPoint.rollbackAttributes();
    });

    this.correspondenceAddressSite.rollbackAttributes();
    this.correspondenceAddress.rollbackAttributes();
  }

  willDestroy() {
    super.willDestroy(...arguments);

    if (!this.save.isRunning) {
      this.reset();
    }
  }

  <template>
    {{pageTitle "Bewerk contactgegevens"}}

    {{#if this.isLoading}}
      <AuLoader class="au-u-margin-top-huge">Contactgegevens aan het laden</AuLoader>
    {{else}}
      <div
        class="au-o-box au-u-padding-left au-u-padding-right au-u-padding-top"
      >
        <section
          class="au-u-flex au-u-flex--between au-u-flex--vertical-baseline au-u-margin-bottom"
        >
          <div class="">
            <AuHeading @level="1" @skin="1">Bewerk contactgegevens</AuHeading>
            <AuHeading
              @level="2"
              @skin="3"
            >{{this.association.name}}</AuHeading>
          </div>

          <div>
            <AuButtonGroup class="au-c-button-group--align-right">
              <AuLink
                @route="association.contact-details"
                @skin="button-secondary"
              >
                Annuleer
              </AuLink>
              <AuButton
                @loading={{this.save.isRunning}}
                @loadingMessage="Opslaan"
                form="contact-details-edit-form"
                type="submit"
              >
                Opslaan
              </AuButton>
            </AuButtonGroup>
          </div>
        </section>

        <AddressEdit @address={{this.correspondenceAddress}} />
      </div>

      <form id="contact-details-edit-form" {{on "submit" this.save.perform}}>
        {{! We don't use the AuDataTable component here because it doesn't rerender when we change the contactPoints array due to its old `computed` usage. }}
        <EditTable>
          <:columns>
            <th>
              Type contactgegeven
            </th>
            <th>
              Waarde
            </th>
            <th>
              {{! favourite }}
            </th>
            <th class="u-shrink-column">
              {{! Delete }}
            </th>
          </:columns>
          <:tbody>
            {{#each this.contactPoints as |contactPoint|}}
              <TableRow
                @contactPoint={{contactPoint}}
                @onDelete={{this.deleteContactPoint}}
                @onPrimaryChange={{this.handlePrimaryChange}}
              />
            {{else}}
              <tr>
                <td colspan="4">
                  <em>Geen contactgegevens toegevoegd</em>
                </td>
              </tr>
            {{/each}}
          </:tbody>
        </EditTable>

        <div class="au-o-box au-u-padding-top-small">
          <AuButton
            @icon="plus"
            @width="block"
            @skin="secondary"
            {{on "click" this.addNewContactPoint}}
          >
            Voeg contactgegeven toe
          </AuButton>
        </div>
      </form>
    {{/if}}
  </template>
}

class AddressEdit extends Component {
  @tracked isSearchMode;

  constructor() {
    super(...arguments);

    this.determineInitialInputMode();
  }

  get isManualInputMode() {
    return !this.isSearchMode;
  }

  determineInitialInputMode() {
    const address = this.args.address;

    if (!address.isNew && !address.addressRegisterUri) {
      this.isSearchMode = false;
    } else {
      this.isSearchMode = true;
    }
  }

  switchToSearchMode = () => {
    this.isSearchMode = true;
    clearAddress(this.args.address);
  };

  switchToManualInputMode = () => {
    this.isSearchMode = false;

    const address = this.args.address;
    address.addressRegisterUri = undefined;
    if (!address.country) {
      address.country = BELGIUM;
    }
  };

  <template>
    <section>
      <EditCard @containsRequiredFields={{this.isManualInputMode}}>
        <:title>
          Correspondentieadres
        </:title>
        <:card as |Card|>
          {{#if this.isSearchMode}}
            <AddressSearch @address={{@address}} as |address|>
              <Card.Columns>
                <:left as |Item|>
                  <Item>
                    <:label>Adres</:label>
                    <:content>
                      <address.Search />
                      <AuButton
                        @skin="link"
                        {{on "click" this.switchToManualInputMode}}
                      >
                        Vul adres manueel in
                      </AuButton>
                    </:content>
                  </Item>
                </:left>
                <:right as |Item|>
                  {{#if address.shouldSelectBusNumber}}
                    <Item>
                      <:label>Bus</:label>
                      <:content>
                        <address.BusNumber />
                      </:content>
                    </Item>
                  {{/if}}
                </:right>
              </Card.Columns>
            </AddressSearch>
          {{else}}
            <Card.Columns>
              <:left as |Item|>
                <Item @labelFor="address-street" @required={{true}}>
                  <:label>Straat</:label>
                  <:content>
                    <AddressInput
                      @value={{@address.street}}
                      @onChange={{fn (mut @address.street)}}
                      @errorMessage={{fieldError @address.errors.street}}
                      id="address-street"
                    />
                    <div>
                      <AuButton
                        @skin="link"
                        {{on "click" this.switchToSearchMode}}
                      >
                        Vind adres in lijst
                      </AuButton>
                    </div>
                  </:content>
                </Item>
                <Item @labelFor="address-number" @required={{true}}>
                  <:label>Huisnummer</:label>
                  <:content>
                    <AddressInput
                      @value={{@address.number}}
                      @onChange={{fn (mut @address.number)}}
                      @errorMessage={{fieldError @address.errors.number}}
                      id="address-number"
                    />
                  </:content>
                </Item>
                <Item @labelFor="address-box-number">
                  <:label>Busnummer</:label>
                  <:content>
                    <AddressInput
                      @value={{@address.boxNumber}}
                      @onChange={{fn (mut @address.boxNumber)}}
                      @errorMessage={{fieldError @address.errors.boxNumber}}
                      id="address-box-number"
                    />
                  </:content>
                </Item>
              </:left>
              <:right as |Item|>
                <Item @labelFor="address-postcode" @required={{true}}>
                  <:label>Postcode</:label>
                  <:content>
                    <AddressInput
                      @value={{@address.postcode}}
                      @onChange={{fn (mut @address.postcode)}}
                      @errorMessage={{fieldError @address.errors.postcode}}
                      id="address-postcode"
                    />
                  </:content>
                </Item>
                <Item @labelFor="address-municipality" @required={{true}}>
                  <:label>Gemeente</:label>
                  <:content>
                    {{#if (isPostcodeInFlanders @address)}}
                      <MunicipalitySelectByName
                        @selected={{@address.municipality}}
                        @onChange={{fn (mut @address.municipality)}}
                        @error={{fieldError @address.errors.municipality}}
                        @id="address-municipality"
                      />
                    {{else}}
                      <AddressInput
                        @value={{@address.municipality}}
                        @onChange={{fn (mut @address.municipality)}}
                        @errorMessage={{fieldError
                          @address.errors.municipality
                        }}
                        id="address-municipality"
                      />
                    {{/if}}
                  </:content>
                </Item>
                <Item @labelFor="address-country" @required={{true}}>
                  <:label>Land</:label>
                  <:content>
                    <CountrySelect
                      @selected={{@address.country}}
                      @onChange={{fn (mut @address.country)}}
                      @error={{fieldError @address.errors.country}}
                      @id="address-country"
                    />
                  </:content>
                </Item>
              </:right>
            </Card.Columns>
          {{/if}}
        </:card>
      </EditCard>
    </section>
  </template>
}

const AddressInput = <template>
  <AuInput
    @width="block"
    @error={{@errorMessage}}
    value={{@value}}
    {{on "blur" (eventValue @onChange trim=true)}}
    ...attributes
  />
  {{#if @errorMessage}}
    <AuHelpText @error={{true}}>{{@errorMessage}}</AuHelpText>
  {{/if}}
</template>;

class TableRow extends Component {
  get editComponent() {
    const CONTACT_TYPE_EDIT_COMPONENTS = {
      [CONTACT_DATA_TYPE.EMAIL]: EmailEdit,
      [CONTACT_DATA_TYPE.TELEPHONE]: TelephoneEdit,
      [CONTACT_DATA_TYPE.SOCIAL_MEDIA]: SocialMediaEdit,
      [CONTACT_DATA_TYPE.WEBSITE]: WebsiteEdit,
    };
    return (
      CONTACT_TYPE_EDIT_COMPONENTS[this.args.contactPoint.name] || NoContactType
    );
  }

  handleTypeChange = (type) => {
    this.args.contactPoint.name = type;
  };

  <template>
    <tr>
      <td>
        <ContactTypeSelect
          @contactPoint={{@contactPoint}}
          @errorMessage={{fieldError @contactPoint.errors.name}}
        />
      </td>
      <this.editComponent
        @contactPoint={{@contactPoint}}
        @onPrimaryChange={{fn @onPrimaryChange @contactPoint}}
      />
      <td class="au-u-text-right">
        <AuButton
          @alert={{true}}
          @hideText={{true}}
          @icon="bin"
          @skin="naked"
          {{on "click" (fn @onDelete @contactPoint)}}
        >Verwijder contactgegeven</AuButton>
      </td>
    </tr>
  </template>
}

class ContactTypeSelect extends Component {
  options = Object.entries(CONTACT_POINT_LABEL).map(([type, label]) => ({
    type,
    label,
  }));

  get selectedType() {
    return this.options.find((option) => {
      return option.type === this.args.contactPoint.name;
    });
  }

  get isDisabled() {
    return !(this.args.contactPoint.isNew || !this.args.contactPoint.name);
  }

  handleChange = (selected) => {
    this.args.contactPoint.name = selected.type;
    this.resetContactPointData();
  };

  resetContactPointData() {
    const contactPoint = this.args.contactPoint;
    contactPoint.email = undefined;
    contactPoint.telephone = undefined;
    contactPoint.website = undefined;
    contactPoint.errors.clear();
  }

  <template>
    <div class={{if @errorMessage "ember-power-select--error"}}>
      <PowerSelect
        @options={{this.options}}
        @selected={{this.selectedType}}
        @onChange={{this.handleChange}}
        @disabled={{this.isDisabled}}
        @placeholder="Selecteer een type contactgegeven"
        @searchEnabled={{false}}
        class="contact-type-select"
        as |option|
      >
        {{option.label}}
      </PowerSelect>
    </div>

    {{#if @errorMessage}}
      <AuHelpText @error={{true}}>{{@errorMessage}}</AuHelpText>
    {{/if}}
  </template>
}

class EmailEdit extends Component {
  <template>
    <EditColumns
      @contactPoint={{@contactPoint}}
      @onPrimaryChange={{@onPrimaryChange}}
      @errorMessage={{fieldError @contactPoint.errors.email}}
    >
      <:input as |ContactInput|>
        <ContactInput
          @width="block"
          value={{@contactPoint.email}}
          {{on "input" (eventValue (fn (mut @contactPoint.email)))}}
        />
      </:input>
      <:checkboxLabel>Favoriet e-mailadres</:checkboxLabel>
    </EditColumns>
  </template>
}

class TelephoneEdit extends Component {
  <template>
    <PhoneInput
      @onUpdate={{fn (mut @contactPoint.telephone)}}
      @value={{@contactPoint.telephone}}
      as |phone|
    >
      {{#let (fieldError @contactPoint.errors.telephone) as |errorMessage|}}
        <EditColumns
          @contactPoint={{@contactPoint}}
          @onPrimaryChange={{@onPrimaryChange}}
          @errorMessage={{errorMessage}}
          @warningMessage={{phone.warning}}
        >
          <:input as |_ id|>
            <phone.Input
              @width="block"
              @error={{if errorMessage true}}
              id={{id}}
            />
          </:input>
          <:checkboxLabel>Favoriet telefoonnummer</:checkboxLabel>
        </EditColumns>
      {{/let}}
    </PhoneInput>
  </template>
}

class SocialMediaEdit extends Component {
  <template>
    <EditColumns
      @contactPoint={{@contactPoint}}
      @onPrimaryChange={{@onPrimaryChange}}
      @errorMessage={{fieldError @contactPoint.errors.website}}
    >
      <:input as |ContactInput|>
        <ContactInput
          @width="block"
          value={{@contactPoint.website}}
          {{on "input" (eventValue (fn (mut @contactPoint.website)))}}
        />
      </:input>
      <:checkboxLabel>Favoriete social media</:checkboxLabel>
    </EditColumns>
  </template>
}

class WebsiteEdit extends Component {
  <template>
    <EditColumns
      @contactPoint={{@contactPoint}}
      @onPrimaryChange={{@onPrimaryChange}}
      @errorMessage={{fieldError @contactPoint.errors.website}}
    >
      <:input as |ContactInput|>
        <ContactInput
          @width="block"
          value={{@contactPoint.website}}
          {{on "input" (eventValue (fn (mut @contactPoint.website)))}}
        />
      </:input>
      <:checkboxLabel>Favoriete website</:checkboxLabel>
    </EditColumns>
  </template>
}

class EditColumns extends Component {
  get label() {
    return CONTACT_POINT_LABEL[this.args.contactPoint.name];
  }

  <template>
    <EditCell
      @errorMessage={{@errorMessage}}
      @warningMessage={{@warningMessage}}
    >
      <:label>
        {{this.label}}
      </:label>
      <:input as |CellInput id|>
        {{yield CellInput id to="input"}}
      </:input>
    </EditCell>
    <td>
      <div class="au-u-margin-top-tiny">
        <AuCheckbox
          @checked={{isPrimaryContactPoint @contactPoint}}
          @onChange={{@onPrimaryChange}}
        >
          {{yield to="checkboxLabel"}}
        </AuCheckbox>
      </div>
    </td>
  </template>
}

const NoContactType = <template>
  <td>
    -
  </td>
  <td>
    -
  </td>
</template>;

// Simple helper that returns the error message of the first error
// EmberData's .errors property always returns an array, but we only ever set a single error message
function fieldError(errors) {
  if (Array.isArray(errors)) {
    return errors.at(0).message;
  }
}
