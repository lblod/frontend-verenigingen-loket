import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuCheckbox from '@appuniversum/ember-appuniversum/components/au-checkbox';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
// import auInputmask from '@appuniversum/ember-appuniversum/modifiers/au-inputmask';
import { getPromiseState } from '@warp-drive/ember';
import { fn } from '@ember/helper';
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
import fieldError from 'frontend-verenigingen-loket/helpers/field-error';
import { representativeContactPointValidationSchema as contactPointValidationSchema } from 'frontend-verenigingen-loket/models/contact-point';
import { validationSchema as personValidationSchema } from 'frontend-verenigingen-loket/models/person';
import { removeItem } from 'frontend-verenigingen-loket/utils/array';
import {
  updateRepresentative,
  removeRepresentative,
} from 'frontend-verenigingen-loket/utils/verenigingsregister';
import { validateRecord } from 'frontend-verenigingen-loket/validations/validate-record';

export default class RepresentativesEdit extends Component {
  @service router;
  @service store;
  representativesToRemove = [];

  get isLoading() {
    // We use the controller's model to work around an Ember bug: https://github.com/emberjs/ember.js/issues/18987
    return this.args.controller.model.task.isRunning;
  }

  get representatives() {
    // We use the controller's model to work around an Ember bug: https://github.com/emberjs/ember.js/issues/18987
    return this.args.controller.model.task.isFinished
      ? this.args.controller.model.task.value
      : [];
  }

  get association() {
    // We use the controller's model to work around an Ember bug: https://github.com/emberjs/ember.js/issues/18987
    return this.args.controller.model.association;
  }

  changePrimaryRepresentative = (changedRepresentative) => {
    const isCurrentPrimary = changedRepresentative.isPrimary;

    if (isCurrentPrimary) {
      changedRepresentative.isPrimary = false;
    } else {
      // This representative isn't the primary yet, but there can only be one primary.
      // We need to find the previous primary and unset it.
      this.representatives.some((representative) => {
        if (representative.isPrimary) {
          representative.isPrimary = false;
          return true;
        }
      });
      changedRepresentative.isPrimary = true;
    }
  };

  deleteRepresentative = async (representative) => {
    removeItem(this.representatives, representative);

    const person = await representative.person;
    const contactPoints = await person.contactPoints;
    const recordsToRemove = [representative, person, ...contactPoints];

    if (!representative.isNew) {
      // If the representative is not new, we need to mark the records for deletion on the server
      this.representativesToRemove.push(representative);
    }

    // We (also) mark the records for deletion in the store, which also removes any newly created ones
    recordsToRemove.forEach((record) => record.deleteRecord());
  };

  addNewRepresentative = () => {
    const contactPoint = this.store.createRecord('contact-point', {});
    const person = this.store.createRecord('person', {
      contactPoints: [contactPoint],
    });
    const membership = this.store.createRecord('membership', {
      person,
    });

    this.representatives.push(membership);
  };

  save = dropTask(async (event) => {
    event.preventDefault();

    const promises = this.representatives.map(async (representative) => {
      const person = await representative.person;

      await validateRecord(person, personValidationSchema);

      const contactPoints = await person.contactPoints;
      // We assume a representative only has a single contact point which can contain all the data we allow users to edit.
      const contactPoint = contactPoints.at(0);

      await validateRecord(contactPoint, contactPointValidationSchema);

      return person.isValid && contactPoint.isValid;
    });

    const isValid = (await Promise.all(promises)).every((isValid) =>
      Boolean(isValid),
    );

    if (isValid) {
      for (const representative of this.representatives) {
        await updateRepresentative(representative, this.association);
      }

      for (const representative of this.representativesToRemove) {
        await removeRepresentative(representative, this.association);
      }

      this.router.transitionTo('association.representatives');
    }
  });

  async reset() {
    const recordsToRollBack = [];
    const representativesToRollBack = [
      ...this.representatives,
      ...this.representativesToRemove,
    ];

    this.representativesToRemove = [];

    for (const representative of representativesToRollBack) {
      const person = await representative.person;
      const contactPoints = await person.contactPoints;
      recordsToRollBack.push(representative, person, ...contactPoints);
    }

    recordsToRollBack.forEach((record) => record.rollbackAttributes());
  }

  willDestroy() {
    super.willDestroy();

    if (!this.save.isRunning) {
      this.reset();
    }
  }

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
            <th>
              Voornaam
            </th>
            <th>
              Achternaam
            </th>
            {{! <RequiredColumn>
              Rijksregisternummer
            </RequiredColumn> }}
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
            {{#each this.representatives as |representative|}}
              <EditRow
                @representative={{representative}}
                @onPrimaryChange={{this.changePrimaryRepresentative}}
                @onDelete={{this.deleteRepresentative}}
              />
            {{else}}
              <tr>
                <td colspan="7">
                  <em>Geen vertegenwoordigers toegevoegd</em>
                </td>
              </tr>
            {{/each}}
          </:tbody>
        </EditTable>
        {{!-- TODO as part of CLBV-591
        <div class="au-o-box au-u-padding-top-small">
          <AuButton
            @icon="plus"
            @width="block"
            @skin="secondary"
            {{on "click" this.addNewRepresentative}}
          >
            Voeg vertegenwoordiger toe
          </AuButton>
        </div> --}}
      </form>
    {{/if}}
  </template>
}

class EditRow extends Component {
  @cached
  get person() {
    const state = getPromiseState(this.args.representative.person);

    if (state.isPending || state.isError) {
      return null;
    }

    return state.result;
  }

  @cached
  get contactPoint() {
    if (!this.person) return null;

    const state = getPromiseState(this.person.contactPoints);

    if (state.isPending || state.isError) {
      return null;
    }

    return state.result?.at(0);
  }

  <template>
    <tr>
      {{#if this.person.isNew}}
        <EditCell @errorMessage={{fieldError this.person.errors.givenName}}>
          <:label>Voornaam</:label>
          <:input as |CellInput|>
            <CellInput
              value={{this.person.givenName}}
              {{on "input" (eventValue (fn (mut this.person.givenName)))}}
            />
          </:input>
        </EditCell>
        <EditCell @errorMessage={{fieldError this.person.errors.familyName}}>
          <:label>Achternaam</:label>
          <:input as |CellInput|>
            <CellInput
              value={{this.person.familyName}}
              {{on "input" (eventValue (fn (mut this.person.familyName)))}}
            />
          </:input>
        </EditCell>
      {{else}}
        <td>
          {{this.person.givenName}}
        </td>
        <td>
          {{this.person.familyName}}
        </td>
      {{/if}}
      {{!-- <EditCell @errorMessage={{fieldError this.person.errors.ssn}}>
        <:label>Rijksregisternummer</:label>
        <:input as |CellInput|>
          {{#if this.person.isNew}}
            <CellInput
              value={{this.person.ssn}}
              {{auInputmask
                options=(hash
                  mask="99.99.99-999.99" autoUnmask="true" placeholder="_"
                )
              }}
              {{on "input" (eventValue (fn (mut this.person.ssn)))}}
              placeholder="00.00.00-000.00"
            />
          {{else}}
            -
          {{/if}}
        </:input>
      </EditCell> --}}
      <EditCell @errorMessage={{fieldError this.contactPoint.errors.email}}>
        <:label>E-mail</:label>
        <:input as |CellInput|>
          <CellInput
            value={{this.contactPoint.email}}
            {{on "input" (eventValue (fn (mut this.contactPoint.email)))}}
          />
        </:input>
      </EditCell>
      <PhoneInput
        @onUpdate={{fn (mut this.contactPoint.telephone)}}
        @value={{this.contactPoint.telephone}}
        as |phone|
      >
        {{#let (fieldError @contactPoint.errors.telephone) as |errorMessage|}}
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
      <EditCell @errorMessage={{fieldError this.contactPoint.errors.website}}>
        <:label>Sociale media</:label>
        <:input as |CellInput|>
          <CellInput
            value={{this.contactPoint.website}}
            {{on "input" (eventValue (fn (mut this.contactPoint.website)))}}
          />
        </:input>
      </EditCell>
      <td>
        <div class="au-u-margin-top-tiny">
          <AuCheckbox
            @checked={{@representative.isPrimary}}
            @onChange={{fn @onPrimaryChange @representative}}
          >
            Primair
          </AuCheckbox>
        </div>
      </td>
      <td class="au-u-text-right">
        <AuButton
          @alert={{true}}
          @hideText={{true}}
          @icon="bin"
          @skin="naked"
          {{on "click" (fn @onDelete @representative)}}
        >Verwijder vertegenwoordiger</AuButton>
      </td>
    </tr>
  </template>
}

const RequiredColumn = <template>
  <th>{{yield}} <RequiredPill /></th>
</template>;
