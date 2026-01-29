import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuCheckbox from '@appuniversum/ember-appuniversum/components/au-checkbox';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import AuTooltip from '@appuniversum/ember-appuniversum/components/au-tooltip';
import auInputmask from '@appuniversum/ember-appuniversum/modifiers/au-inputmask';
import { getPromiseState } from '@warp-drive/ember';
import { fn, hash } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { pageTitle } from 'ember-page-title';
import PhoneInput from 'frontend-verenigingen-loket/components/phone-input';
import EditTable, {
  EditCell,
} from 'frontend-verenigingen-loket/components/edit-table';
import RequiredPill from 'frontend-verenigingen-loket/components/required-pill';
import eventValue from 'frontend-verenigingen-loket/helpers/event-value';
import { removeItem } from 'frontend-verenigingen-loket/utils/array';
import TrackedData from 'frontend-verenigingen-loket/utils/tracked-data';
import {
  createOrUpdateVertegenwoordiger,
  removeVertegenwoordiger,
  handleError,
  waitForStableAPI,
} from 'frontend-verenigingen-loket/utils/verenigingsregister';
import { isValidRijksregisternummer } from 'frontend-verenigingen-loket/utils/rijksregisternummer';
import { validateData } from 'frontend-verenigingen-loket/utils/validate-tracked-data';
import Joi from 'joi';

const validationSchema = Joi.object({
  voornaam: Joi.string().empty('').required(),
  achternaam: Joi.string().empty('').required(),
  // todo, real prop name
  insz: Joi.string()
    .empty('')
    .when('$isNew', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .custom((value: string, helpers: Joi.CustomHelpers<string>) => {
      if (!isValidRijksregisternummer(value)) {
        return helpers.error('string.invalid-ssn');
      }

      return value;
    }),
  'e-mail': Joi.string().empty('').email({ tlds: false }).required().messages({
    'string.email': 'Geef een geldig e-mailadres in.',
  }),
  telefoon: Joi.string()
    .empty('')
    .regex(/^(tel:)?\+?[0-9]*$/)
    .optional()
    .messages({
      'string.pattern.base': 'Enkel een plusteken en cijfers zijn toegelaten.',
    }),
  socialMedia: Joi.string()
    .empty('')
    .uri()
    .optional()
    .messages({ 'string.uri': 'Geef een geldig internetadres in.' }),
}).messages({
  'any.required': 'Dit veld is verplicht.',
  'string.invalid-ssn': 'Geen geldig rijksregisternummer.',
});

export default class RepresentativesEdit extends Component {
  @service currentAssociation;
  @service router;
  @service store;
  @service toaster;
  representativesToRemove = [];

  @cached
  get isLoading() {
    // We use the controller's model to work around an Ember bug: https://github.com/emberjs/ember.js/issues/18987
    const state = getPromiseState(this.args.controller.model.dataPromise);
    return state.isPending;
  }

  @cached
  get vertegenwoordigers() {
    // We use the controller's model to work around an Ember bug: https://github.com/emberjs/ember.js/issues/18987
    const state = getPromiseState(this.args.controller.model.dataPromise);

    return state.isSuccess ? state.result.vertegenwoordigers : [];
  }

  @cached
  get roles() {
    // We use the controller's model to work around an Ember bug: https://github.com/emberjs/ember.js/issues/18987
    const state = getPromiseState(this.args.controller.model.dataPromise);

    return state.isSuccess ? state.result.roles : [];
  }

  get association() {
    return this.currentAssociation.association;
  }

  get canDeleteVertegenwoordigers() {
    return this.vertegenwoordigers.length > 1;
  }

  changePrimaryRepresentative = async (changingVertegenwoordiger) => {
    const isCurrentPrimary = changingVertegenwoordiger.isPrimair;

    if (isCurrentPrimary) {
      changingVertegenwoordiger.isPrimair = false;
    } else {
      // This representative isn't the primary yet, but there can only be one primary.
      // We need to find the previous primary and unset it.
      for (const vertegenwoordiger of this.vertegenwoordigers) {
        if (vertegenwoordiger.data.isPrimair) {
          vertegenwoordiger.data.isPrimair = false;
          break;
        }
      }
      changingVertegenwoordiger.data.isPrimair = true;
    }
  };

  deleteRepresentative = async (vertegenwoordiger) => {
    removeItem(this.vertegenwoordigers, vertegenwoordiger);

    if (!vertegenwoordiger.isNew) {
      // If the representative is not new, we need to mark the records for deletion on the server
      this.representativesToRemove.push(vertegenwoordiger);
    }
  };

  addNewRepresentative = () => {
    this.vertegenwoordigers.push(new TrackedData({}));
  };

  save = dropTask(async (event) => {
    event.preventDefault();

    const promises = this.vertegenwoordigers.map((vertegenwoordiger) => {
      return validateData(vertegenwoordiger, validationSchema, {
        context: {
          isNew: vertegenwoordiger.isNew,
        },
      });
    });

    await Promise.all(promises);

    const isValid = !this.vertegenwoordigers.some(
      (vertegenwoordiger) => vertegenwoordiger.hasErrors,
    );

    if (isValid) {
      try {
        console.log('all valid!');
        // The order of API operations is important here because there can only be one primary representative.
        // Ensure there can never be a scenario where there would be 2 primary representatives at the same time (even temporarily), because the API will return an error response.

        // for (const representative of this.representativesToRemove) {
        //   await removeVertegenwoordiger(representative.data, this.association);
        //   // TODO: Mark the representative as deleted, so we no longer try to delete it again
        // }

        // const sortedRepresentatives = [
        //   ...this.vertegenwoordigers.filter((rep) => !rep.isPrimair),
        //   ...this.vertegenwoordiger.filter((rep) => rep.isPrimair),
        // ];

        // for (const representative of sortedRepresentatives) {
        //   // TODO; deal with API validation errors and make them visible to the user
        //   if (representative.hasChanges || representative.isNew) {
        //     await createOrUpdateVertegenwoordiger(
        //       representative.data,
        //       this.association,
        //       representative.isNew,
        //     );
        //   }
        //   // TODO: mark the representative as persisted, so we no longer try to persist it again (which causes issues with creates)
        // }

        await waitForStableAPI();
        this.router.transitionTo('association.representatives');
      } catch (error) {
        handleError(this.toaster, error);
      }
    }
  });

  <template>
    {{pageTitle "Bewerk vertegenwoordigers"}}

    {{#if this.isLoading}}
      <AuLoader class="au-u-margin-top-huge">Vertegenwoordigers aan het laden</AuLoader>
    {{else}}
      <div
        class="au-o-box au-u-padding-left au-u-padding-right au-u-padding-top"
      >
        <section
          class="au-u-flex au-u-flex--between au-u-flex--vertical-baseline au-u-margin-bottom"
        >
          <div class="">
            <AuHeading @level="1" @skin="1">Bewerk vertegenwoordigers</AuHeading>
            <AuHeading @level="2" @skin="3">
              {{this.association.name}}
            </AuHeading>
          </div>

          <div>
            <AuButtonGroup class="au-c-button-group--align-right">
              <AuLink
                @route="association.representatives"
                @skin="button-secondary"
              >
                Annuleer
              </AuLink>
              <AuButton
                @loading={{this.save.isRunning}}
                @loadingMessage="Opslaan"
                form="representatives-edit-form"
                type="submit"
              >
                Opslaan
              </AuButton>
            </AuButtonGroup>
          </div>
        </section>
      </div>

      <form id="representatives-edit-form" {{on "submit" this.save.perform}}>
        {{! We don't use the AuDataTable component here because it doesn't rerender when we change the representatives array due to its old `computed` usage. }}
        <EditTable>
          <:columns>
            <RequiredColumn>
              Voornaam
            </RequiredColumn>
            <RequiredColumn>
              Achternaam
            </RequiredColumn>
            <RequiredColumn>
              Rijksregisternummer
            </RequiredColumn>
            <RequiredColumn>
              E-mail
            </RequiredColumn>
            <th>
              Telefoonnummer
            </th>
            <th>
              Sociale media
            </th>
            <th>
              {{! favourite }}
            </th>
            <th class="u-shrink-column">
              {{! Delete }}
            </th>
          </:columns>
          <:tbody>
            {{#each this.vertegenwoordigers as |vertegenwoordiger|}}
              <EditRow
                @vertegenwoordiger={{vertegenwoordiger}}
                @onPrimaryChange={{this.changePrimaryRepresentative}}
                @canDelete={{this.canDeleteVertegenwoordigers}}
                @onDelete={{this.deleteRepresentative}}
              />
            {{else}}
              <tr>
                <td colspan="8">
                  <em>Geen vertegenwoordigers toegevoegd</em>
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
            {{on "click" this.addNewRepresentative}}
          >
            Voeg vertegenwoordiger toe
          </AuButton>
        </div>
      </form>
    {{/if}}
  </template>
}

class EditRow extends Component {
  get isDeleteDisabled() {
    return !this.args.canDelete;
  }

  <template>
    <tr>
      {{#if @vertegenwoordiger.isNew}}
        <EditCell @errorMessage={{@vertegenwoordiger.errors.voornaam}}>
          <:label>Voornaam</:label>
          <:input as |CellInput|>
            <CellInput
              value={{this.vertegenwoordiger.data.voornaam}}
              {{on
                "input"
                (eventValue (fn (mut @vertegenwoordiger.data.voornaam)))
              }}
            />
          </:input>
        </EditCell>
        <EditCell @errorMessage={{@vertegenwoordiger.errors.achternaam}}>
          <:label>Achternaam</:label>
          <:input as |CellInput|>
            <CellInput
              value={{@vertegenwoordiger.data.achternaam}}
              {{on
                "input"
                (eventValue (fn (mut @vertegenwoordiger.data.achternaam)))
              }}
            />
          </:input>
        </EditCell>
        <EditCell @errorMessage={{@vertegenwoordiger.errors.insz}}>
          <:label>Rijksregisternummer</:label>
          <:input as |CellInput|>
            <CellInput
              value={{@vertegenwoordiger.data.insz}}
              {{auInputmask
                options=(hash
                  mask="99.99.99-999.99" autoUnmask="true" placeholder="_"
                )
              }}
              {{on
                "input"
                (eventValue (fn (mut @vertegenwoordiger.data.insz)))
              }}
              placeholder="00.00.00-000.00"
            />
          </:input>
        </EditCell>
      {{else}}
        <td>
          {{@vertegenwoordiger.data.voornaam}}
        </td>
        <td>
          {{@vertegenwoordiger.data.achternaam}}
        </td>
        <td>
          -
        </td>
      {{/if}}
      <EditCell @errorMessage={{@vertegenwoordiger.errors.e-mail}}>
        <:label>E-mail</:label>
        <:input as |CellInput|>
          <CellInput
            value={{@vertegenwoordiger.data.e-mail}}
            {{on
              "input"
              (eventValue (fn (mut @vertegenwoordiger.data.e-mail)))
            }}
          />
        </:input>
      </EditCell>
      <PhoneInput
        @onUpdate={{fn (mut @vertegenwoordiger.data.telefoon)}}
        @value={{@vertegenwoordiger.data.telefoon}}
        as |phone|
      >
        {{#let @contactPoint.errors.telefoon as |errorMessage|}}
          <EditCell
            @errorMessage={{errorMessage}}
            @warningMessage={{phone.warning}}
          >
            <:label>Telefoonnummer</:label>
            <:input as |_ id|>
              <phone.Input @error={{if errorMessage true}} id={{id}} />
            </:input>
          </EditCell>
        {{/let}}
      </PhoneInput>
      <EditCell @errorMessage={{@vertegenwoordiger.errors.socialMedia}}>
        <:label>Sociale media</:label>
        <:input as |CellInput|>
          <CellInput
            value={{@vertegenwoordiger.data.socialMedia}}
            {{on
              "input"
              (eventValue (fn (mut @vertegenwoordiger.data.socialMedia)))
            }}
          />
        </:input>
      </EditCell>
      <td>
        <div class="au-u-margin-top-tiny">
          <AuCheckbox
            @checked={{@vertegenwoordiger.data.isPrimair}}
            @onChange={{fn @onPrimaryChange @vertegenwoordiger}}
          >
            Primair
          </AuCheckbox>
        </div>
      </td>
      <td class="au-u-text-right">
        <AuTooltip @placement="left" as |tooltip|>
          <AuButton
            @disabled={{this.isDeleteDisabled}}
            @alert={{true}}
            @hideText={{true}}
            @icon="bin"
            @skin="naked"
            {{(if this.isDeleteDisabled tooltip.target)}}
            {{on "click" (fn @onDelete @vertegenwoordiger)}}
          >Verwijder vertegenwoordiger</AuButton>
          <tooltip.Content>
            De vereniging moet minstens 1 vertegenwoordiger hebben.
          </tooltip.Content>
        </AuTooltip>
      </td>
    </tr>
  </template>
}

const RequiredColumn = <template>
  <th>{{yield}} <RequiredPill /></th>
</template>;
