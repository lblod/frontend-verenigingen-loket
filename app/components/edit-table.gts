import AuHelpText from '@appuniversum/ember-appuniversum/components/au-help-text';
import AuInput from '@appuniversum/ember-appuniversum/components/au-input';
import type { TOC } from '@ember/component/template-only';
import { uniqueId } from '@ember/helper';
import Component from '@glimmer/component';

interface EditTableSignature {
  Element: HTMLDivElement;
  Blocks: {
    columns: [];
    tbody: [];
  };
}

<template>
  <div class="c-edit-table au-c-data-table" ...attributes>
    <div class="au-c-data-table__wrapper">
      <table class="au-c-data-table__table">
        <thead>
          <tr class="au-c-data-table__header">
            {{yield to="columns"}}
          </tr>
        </thead>
        <tbody>
          {{yield to="tbody"}}
        </tbody>
      </table>
    </div>
  </div>
</template> satisfies TOC<EditTableSignature>;

export class EditCell extends Component {
  id = uniqueId();

  <template>
    <td ...attributes>
      <label class="au-u-hidden-visually" for={{this.id}}>
        {{this.label}}
      </label>
      {{yield
        (component
          CellInput id=this.id error=@errorMessage warning=@warningMessage
        )
        this.id
        to="input"
      }}

      {{#if @errorMessage}}
        <AuHelpText @error={{true}}>{{@errorMessage}}</AuHelpText>
      {{else if @warningMessage}}
        <AuHelpText @warning={{true}}>{{@warningMessage}}</AuHelpText>
      {{/if}}
    </td>
  </template>
}

const CellInput = <template>
  <AuInput
    @width={{@width}}
    @error={{@error}}
    @warning={{@warning}}
    id={{@id}}
    ...attributes
  />
</template>;
