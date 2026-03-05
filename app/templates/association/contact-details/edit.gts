import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuCheckbox from '@appuniversum/ember-appuniversum/components/au-checkbox';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuHelpText from '@appuniversum/ember-appuniversum/components/au-help-text';
import AuInput, {
  type AuInputSignature,
} from '@appuniversum/ember-appuniversum/components/au-input';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
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
  type YieldedCellInput,
} from 'frontend-verenigingen-loket/components/edit-table';
import eventValue from 'frontend-verenigingen-loket/helpers/event-value';
import { removeItem } from 'frontend-verenigingen-loket/utils/array';
import {
  createOrUpdateContactgegeven,
  deleteContactgegeven,
  createOrUpdateCorrespondenceLocatie,
  deleteCorrespondenceLocatie,
  handleError,
  waitForStableAPI,
  type Contactgegeven,
  type ContactgegevenType,
  CONTACTGEGEVEN_LABEL,
  type AdresIdentifier,
  type Adres,
} from 'frontend-verenigingen-loket/utils/verenigingsregister';
import type RouterService from '@ember/routing/router-service';
import type StoreService from 'frontend-verenigingen-loket/services/store';
import type ToasterService from '@appuniversum/ember-appuniversum/services/toaster';
import type { ModelFrom } from 'frontend-verenigingen-loket/type-utils/model-from';
import type AssociationContactDetailsEditRoute from 'frontend-verenigingen-loket/routes/association/contact-details/edit';
import type CurrentAssociationService from 'frontend-verenigingen-loket/services/current-association';
import TrackedData from 'frontend-verenigingen-loket/utils/tracked-data';
import type { TOC } from '@ember/component/template-only';
import { getPromiseState } from '@warp-drive/ember';
import { assert } from '@ember/debug';
import type { ComponentLike } from '@glint/template';
import Joi from 'joi';
import { validateData } from 'frontend-verenigingen-loket/utils/validate-tracked-data';
import type Owner from '@ember/owner';
import { associationVCode } from 'frontend-verenigingen-loket/models/association';
import {
  BELGIUM,
  clearAdresValues,
  isEmptyAdres,
  isPostcodeInFlanders,
} from 'frontend-verenigingen-loket/utils/verenigingsregister/adres';

interface ContactEditSignature {
  Args: {
    controller: {
      model: ModelFrom<AssociationContactDetailsEditRoute>;
    };
  };
}

export default class ContactEdit extends Component<ContactEditSignature> {
  @service declare currentAssociation: CurrentAssociationService;
  @service declare router: RouterService;
  @service declare store: StoreService;
  @service declare toaster: ToasterService;
  contactgegevensToRemove: TrackedData<Partial<Contactgegeven>>[] = [];

  @cached
  get isLoading() {
    // We use the controller's model to work around an Ember bug: https://github.com/emberjs/ember.js/issues/18987
    const state = getPromiseState(this.args.controller.model.dataPromise);
    return state.isPending;
  }

  get association() {
    return this.currentAssociation.association;
  }

  get contactgegevens() {
    // We use the controller's model to work around an Ember bug: https://github.com/emberjs/ember.js/issues/18987
    const state = getPromiseState(this.args.controller.model.dataPromise);

    return state.isSuccess ? state.value.contactgegevens : [];
  }

  get locatie() {
    // We use the controller's model to work around an Ember bug: https://github.com/emberjs/ember.js/issues/18987
    const state = getPromiseState(this.args.controller.model.dataPromise);
    assert('locatie was accessed before it was loaded', state.isSuccess);
    return state.value.locatie;
  }

  get adres() {
    // We use the controller's model to work around an Ember bug: https://github.com/emberjs/ember.js/issues/18987
    const state = getPromiseState(this.args.controller.model.dataPromise);
    assert('adres was accessed before it was loaded', state.isSuccess);
    return state.value.adres;
  }

  save = dropTask(async (event: Event) => {
    event.preventDefault();

    const promises = this.contactgegevens.map(async (contactgegeven) => {
      await validateData(contactgegeven, contactgegevenValidationSchema);

      return !contactgegeven.hasErrors;
    });

    const isValid = (await Promise.all(promises)).every((isValid) => isValid);

    if (!isValid) {
      return;
    }

    const adres = this.adres;
    const shouldValidateAddress =
      !isEmptyAdres(adres.data) && !adres.data.bronwaarde;

    if (shouldValidateAddress) {
      await validateData(adres, adresValidationSchema);

      if (adres.hasErrors) {
        return;
      }
    }

    try {
      const vCode = await associationVCode(this.association);
      for (const contactgegeven of this.contactgegevensToRemove) {
        assert(
          'only existing contactgegevens can be deleted',
          contactgegeven.data.contactgegevenId,
        );
        await deleteContactgegeven(vCode, contactgegeven.data.contactgegevenId);
      }
      this.contactgegevensToRemove = [];

      const contactgegevensToSave = this.contactgegevens.filter(
        (contactgegeven) => contactgegeven.hasChanges,
      );

      // We save the primary contactgegevens last.
      // This prevents the scenario where there are temporarily multiple primary contactgegevens of the same type.
      const sortedContactgegevensToSave = [
        ...contactgegevensToSave.filter(
          (contactgegeven) => !contactgegeven.data.isPrimair,
        ),
        ...contactgegevensToSave.filter(
          (contactgegeven) => contactgegeven.data.isPrimair,
        ),
      ];

      for (const contactgegeven of sortedContactgegevensToSave) {
        const changedData: Partial<
          Record<keyof Contactgegeven, Contactgegeven[keyof Contactgegeven]>
        > = {};

        for (const value of contactgegeven.changedValues) {
          changedData[value] = contactgegeven.data[value];
        }

        await createOrUpdateContactgegeven({
          vCode,
          contactgegevenId: contactgegeven.data.contactgegevenId,
          data: changedData as Partial<Contactgegeven>,
        });
      }

      // We only check the address for changes, since site details can't be changed on this page
      if (adres.hasChanges) {
        if (isEmptyAdres(adres.data)) {
          if (this.locatie) {
            await deleteCorrespondenceLocatie(vCode, this.locatie.locatieId);
          }
        } else {
          await createOrUpdateCorrespondenceLocatie({
            vCode,
            locatieId: this.locatie?.locatieId,
            data: adres.data,
          });
        }
      }

      await waitForStableAPI();
      this.router.transitionTo('association.contact-details');
    } catch (error) {
      if (error instanceof Error) {
        handleError(this.toaster, error);
      }
    }
  });

  handlePrimaryChange = (contactgegeven: TrackedData<Contactgegeven>) => {
    const isCurrentPrimary = contactgegeven.data.isPrimair;

    if (isCurrentPrimary) {
      contactgegeven.data.isPrimair = false;
    } else {
      // This contact point isn't the primary yet, but there can only be one primary per type.
      // We need to find the previous primary contact point of the same type and unset it.
      this.contactgegevens.some((cp) => {
        if (
          cp.data.contactgegeventype ===
            contactgegeven.data.contactgegeventype &&
          cp.data.isPrimair
        ) {
          cp.data.isPrimair = false;
          return true;
        }
      });

      contactgegeven.data.isPrimair = true;
    }
  };

  deleteContactgegeven = (
    contactgegeven: TrackedData<Partial<Contactgegeven>>,
  ) => {
    removeItem(this.contactgegevens, contactgegeven);

    if (!contactgegeven.isNew) {
      // If the contact point is not new, we need to mark it for deletion
      this.contactgegevensToRemove.push(contactgegeven);
    }
  };

  addNewContactgegeven = () => {
    const contactgegeven: TrackedData<Partial<Contactgegeven>> =
      new TrackedData({});

    this.contactgegevens.push(contactgegeven);
  };

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

        <AddressEdit @adres={{this.adres}} />
      </div>

      <form id="contact-details-edit-form" {{on "submit" this.save.perform}}>
        {{! We don't use the AuDataTable component here because it doesn't rerender when we change the contactgegevens array due to its old `computed` usage. }}
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
            {{#each this.contactgegevens as |contactgegeven|}}
              <TableRow
                @contactgegeven={{contactgegeven}}
                @onDelete={{this.deleteContactgegeven}}
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
            {{on "click" this.addNewContactgegeven}}
          >
            Voeg contactgegeven toe
          </AuButton>
        </div>
      </form>
    {{/if}}
  </template>
}

interface AddressEditSignature {
  Args: {
    adres: TrackedData<Partial<Adres & AdresIdentifier>>;
  };
}
class AddressEdit extends Component<AddressEditSignature> {
  @tracked isSearchMode = true;

  constructor(owner: Owner, args: AddressEditSignature['Args']) {
    super(owner, args);

    this.determineInitialInputMode();
  }

  get isManualInputMode() {
    return !this.isSearchMode;
  }

  determineInitialInputMode() {
    const adres = this.args.adres;

    if (!adres.isNew && !adres.data.bronwaarde) {
      this.isSearchMode = false;
    } else {
      this.isSearchMode = true;
    }
  }

  switchToSearchMode = () => {
    this.isSearchMode = true;
    clearAdresValues(this.args.adres.data);
  };

  switchToManualInputMode = () => {
    this.isSearchMode = false;

    const adres = this.args.adres;
    adres.data.bronwaarde = undefined;
    if (!adres.data.land) {
      adres.data.land = BELGIUM;
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
            <AddressSearch @adres={{@adres}} as |address|>
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
                      @value={{@adres.data.straatnaam}}
                      @onChange={{fn (mut @adres.data.straatnaam)}}
                      @errorMessage={{@adres.errors.straatnaam}}
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
                      @value={{@adres.data.huisnummer}}
                      @onChange={{fn (mut @adres.data.huisnummer)}}
                      @errorMessage={{@adres.errors.huisnummer}}
                      id="address-number"
                    />
                  </:content>
                </Item>
                <Item @labelFor="address-box-number">
                  <:label>Busnummer</:label>
                  <:content>
                    <AddressInput
                      @value={{@adres.data.busnummer}}
                      @onChange={{fn (mut @adres.data.busnummer)}}
                      @errorMessage={{@adres.errors.busnummer}}
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
                      @value={{@adres.data.postcode}}
                      @onChange={{fn (mut @adres.data.postcode)}}
                      @errorMessage={{@adres.errors.postcode}}
                      id="address-postcode"
                    />
                  </:content>
                </Item>
                <Item @labelFor="address-municipality" @required={{true}}>
                  <:label>Gemeente</:label>
                  <:content>
                    {{#if (isPostcodeInFlanders @adres.data)}}
                      <MunicipalitySelectByName
                        @selected={{@adres.data.gemeente}}
                        @onChange={{fn (mut @adres.data.gemeente)}}
                        @error={{if @adres.errors.gemeente true}}
                        @id="address-municipality"
                      />
                    {{else}}
                      <AddressInput
                        @value={{@adres.data.gemeente}}
                        @onChange={{fn (mut @adres.data.gemeente)}}
                        @errorMessage={{@adres.errors.gemeente}}
                        id="address-municipality"
                      />
                    {{/if}}
                  </:content>
                </Item>
                <Item @labelFor="address-country" @required={{true}}>
                  <:label>Land</:label>
                  <:content>
                    <CountrySelect
                      @selected={{@adres.data.land}}
                      @onChange={{fn (mut @adres.data.land)}}
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

interface AddressInputSignature {
  Args: {
    errorMessage?: string;
    value?: string;
    onChange: (value: string) => void;
  };
  Element: AuInputSignature['Element'];
}

const AddressInput = <template>
  <AuInput
    @width="block"
    @error={{if @errorMessage true false}}
    value={{@value}}
    {{on "blur" (eventValue @onChange trim=true)}}
    ...attributes
  />
  {{#if @errorMessage}}
    <AuHelpText @error={{true}}>{{@errorMessage}}</AuHelpText>
  {{/if}}
</template> satisfies TOC<AddressInputSignature>;

interface TableRowSignature {
  Args: {
    contactgegeven: TrackedData<Partial<Contactgegeven>>;
    onPrimaryChange: (contactgegeven: TrackedData<Contactgegeven>) => void;
    onDelete: (contactgegeven: TrackedData<Contactgegeven>) => void;
  };
}
class TableRow extends Component<TableRowSignature> {
  get editComponent() {
    if (!this.args.contactgegeven.data.contactgegeventype) {
      return NoContactType;
    }

    const CONTACT_TYPE_EDIT_COMPONENTS: Record<
      ContactgegevenType,
      ComponentLike<EditFieldSignature>
    > = {
      'E-mail': EmailEdit,
      Telefoon: TelephoneEdit,
      SocialMedia: SocialMediaEdit,
      Website: WebsiteEdit,
    };

    return (
      CONTACT_TYPE_EDIT_COMPONENTS[
        this.args.contactgegeven.data.contactgegeventype
      ] || NoContactType
    );
  }

  <template>
    <tr>
      <td>
        <ContactTypeSelect
          @contactgegeven={{@contactgegeven}}
          @errorMessage={{@contactgegeven.errors.contactgegeventype}}
        />
      </td>
      <this.editComponent
        @contactgegeven={{@contactgegeven}}
        @onPrimaryChange={{fn @onPrimaryChange @contactgegeven}}
      />
      <td class="au-u-text-right">
        <AuButton
          @alert={{true}}
          @hideText={{true}}
          @icon="bin"
          @skin="naked"
          {{on "click" (fn @onDelete @contactgegeven)}}
        >Verwijder contactgegeven</AuButton>
      </td>
    </tr>
  </template>
}

interface ContactTypeSelectSignature {
  Args: {
    contactgegeven: TrackedData<Partial<Contactgegeven>>;
    errorMessage?: string;
  };
}
class ContactTypeSelect extends Component<ContactTypeSelectSignature> {
  options = Object.entries(CONTACTGEGEVEN_LABEL).map(([type, label]) => ({
    type,
    label,
  }));

  get selectedType() {
    return this.options.find((option) => {
      return option.type === this.args.contactgegeven.data.contactgegeventype;
    });
  }

  get isDisabled() {
    return !(
      this.args.contactgegeven.isNew ||
      !this.args.contactgegeven.data.contactgegeventype
    );
  }

  handleChange = (selected: { type: ContactgegevenType; label: string }) => {
    this.args.contactgegeven.data.contactgegeventype = selected.type;
    this.resetContactgegevenData();
  };

  resetContactgegevenData() {
    const contactgegeven = this.args.contactgegeven;
    contactgegeven.data.waarde = undefined;
    contactgegeven.clearErrors();
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

interface EditFieldSignature {
  Args: {
    contactgegeven: TrackedData<Partial<Contactgegeven>>;
    onPrimaryChange: (value: boolean) => void;
  };
}

const EmailEdit = <template>
  <EditColumns
    @contactgegeven={{@contactgegeven}}
    @onPrimaryChange={{@onPrimaryChange}}
    @errorMessage={{@contactgegeven.errors.waarde}}
  >
    <:input as |ContactInput|>
      <ContactInput
        @width="block"
        value={{@contactgegeven.data.waarde}}
        {{on "input" (eventValue (fn (mut @contactgegeven.data.waarde)))}}
      />
    </:input>
    <:checkboxLabel>Favoriet e-mailadres</:checkboxLabel>
  </EditColumns>
</template> satisfies TOC<EditFieldSignature>;

const TelephoneEdit = <template>
  <PhoneInput
    @onUpdate={{fn (mut @contactgegeven.data.waarde)}}
    @value={{@contactgegeven.data.waarde}}
    as |phone|
  >
    {{#let @contactgegeven.errors.waarde as |errorMessage|}}
      <EditColumns
        @contactgegeven={{@contactgegeven}}
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
</template> satisfies TOC<EditFieldSignature>;

const SocialMediaEdit = <template>
  <EditColumns
    @contactgegeven={{@contactgegeven}}
    @onPrimaryChange={{@onPrimaryChange}}
    @errorMessage={{@contactgegeven.errors.waarde}}
  >
    <:input as |ContactInput|>
      <ContactInput
        @width="block"
        value={{@contactgegeven.data.waarde}}
        {{on "input" (eventValue (fn (mut @contactgegeven.data.waarde)))}}
      />
    </:input>
    <:checkboxLabel>Favoriete social media</:checkboxLabel>
  </EditColumns>
</template> satisfies TOC<EditFieldSignature>;

const WebsiteEdit = <template>
  <EditColumns
    @contactgegeven={{@contactgegeven}}
    @onPrimaryChange={{@onPrimaryChange}}
    @errorMessage={{@contactgegeven.errors.waarde}}
  >
    <:input as |ContactInput|>
      <ContactInput
        @width="block"
        value={{@contactgegeven.data.waarde}}
        {{on "input" (eventValue (fn (mut @contactgegeven.data.waarde)))}}
      />
    </:input>
    <:checkboxLabel>Favoriete website</:checkboxLabel>
  </EditColumns>
</template> satisfies TOC<EditFieldSignature>;

interface EditColumnsSignature {
  Args: {
    contactgegeven: TrackedData<Partial<Contactgegeven>>;
    errorMessage?: string;
    warningMessage?: string;
    onPrimaryChange?: (newValue: boolean) => void;
  };
  Blocks: {
    input: [YieldedCellInput, string];
    checkboxLabel: [];
  };
}

class EditColumns extends Component<EditColumnsSignature> {
  get label() {
    assert(
      'contactgegeventype should is expected to be set',
      this.args.contactgegeven.data.contactgegeventype,
    );
    return CONTACTGEGEVEN_LABEL[
      this.args.contactgegeven.data.contactgegeventype
    ];
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
          @checked={{@contactgegeven.data.isPrimair}}
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

export const adresValidationSchema = Joi.object({
  straatnaam: Joi.string().empty('').required(),
  huisnummer: Joi.string().empty('').required(),
  busnummer: Joi.string().empty(''),
  postcode: Joi.string().empty('').required(),
  gemeente: Joi.string().empty('').required(),
  land: Joi.string().empty('').required(),
}).messages({
  'any.required': 'Dit veld is verplicht.',
});

export const contactgegevenValidationSchema = Joi.object({
  contactgegeventype: Joi.string()
    // users can only pick from the select component, so we don't further restrict it
    .required(),
  waarde: Joi.string()
    .empty('')
    .when('contactgegeventype', {
      switch: [
        {
          is: 'E-mail' satisfies ContactgegevenType,
          then: Joi.string()
            .required()
            .email({ tlds: false })
            .messages({ 'string.email': 'Geef een geldig e-mailadres in.' }),
        },
        {
          is: 'Telefoon' satisfies ContactgegevenType,
          then: Joi.string()
            .required()
            .regex(/^(tel:)?\+?[0-9]*$/)
            .messages({
              'string.pattern.base':
                'Enkel een plusteken en cijfers zijn toegelaten.',
            }),
        },
        {
          is: 'Website' satisfies ContactgegevenType,
          then: Joi.string()
            .required()
            .uri()
            .messages({ 'string.uri': 'Geef een geldig internetadres in.' }),
        },
        {
          is: 'SocialMedia' satisfies ContactgegevenType,
          then: Joi.string()
            .required()
            .uri()
            .messages({ 'string.uri': 'Geef een geldig internetadres in.' }),
        },
      ],
      otherwise: Joi.optional(),
    }),
}).messages({
  'any.required': 'Dit veld is verplicht.',
});
