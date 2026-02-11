import AuHelpText from '@appuniversum/ember-appuniversum/components/au-help-text';
import AuInput, {
  type AuInputSignature,
} from '@appuniversum/ember-appuniversum/components/au-input';
import type { TOC } from '@ember/component/template-only';
import { uniqueId } from '@ember/helper';
import Component from '@glimmer/component';
import type { WithBoundArgs } from '@glint/template';

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

interface EditCellSignature {
  Args: {
    errorMessage?: string;
    warningMessage?: string;
  };
  Element: HTMLTableCellElement;
  Blocks: {
    label: [];
    input: [
      WithBoundArgs<typeof CellInput, 'id' | 'error' | 'warning'>,
      string,
    ];
  };
}

export class EditCell extends Component<EditCellSignature> {
  id = uniqueId();

  get error() {
    return Boolean(this.args.errorMessage);
  }

  get warning() {
    return Boolean(this.args.warningMessage);
  }

  <template>
    <td ...attributes>
      <label class="au-u-hidden-visually" for={{this.id}}>
        {{yield to="label"}}
      </label>
      {{yield
        (component CellInput id=this.id error=this.error warning=this.warning)
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

interface CellInputSignature {
  Args: {
    width?: AuInputSignature['Args']['width'];
    error?: boolean;
    warning?: boolean;
    id: string;
  };
  Element: AuInputSignature['Element'];
}

const CellInput = <template>
  <AuInput
    @width={{@width}}
    @error={{@error}}
    @warning={{@warning}}
    id={{@id}}
    ...attributes
  />
</template> satisfies TOC<CellInputSignature>;
