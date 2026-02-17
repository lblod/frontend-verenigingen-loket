import AuHeading, {
  type AuHeadingSignature,
} from '@appuniversum/ember-appuniversum/components/au-heading';
import AuHelpText from '@appuniversum/ember-appuniversum/components/au-help-text';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import { hash } from '@ember/helper';
import type { TOC } from '@ember/component/template-only';

interface EditCardSignature {
  Args: {
    headingLevel?: AuHeadingSignature['Args']['level'];
    headingSkin?: AuHeadingSignature['Args']['skin'];
    containsRequiredFields?: boolean;
  };
  Element: HTMLDivElement;
  Blocks: {
    title: [];
    card: [
      {
        Columns: typeof CardColumns;
      },
    ];
  };
}

<template>
  <div class="au-u-max-width-large" ...attributes>
    {{#if (has-block "title")}}
      <AuHeading
        @level={{if @headingLevel @headingLevel "3"}}
        @skin={{if @headingSkin @headingSkin "5"}}
        class="au-u-margin-bottom-tiny"
      >
        {{yield to="title"}}
      </AuHeading>
    {{/if}}

    <div class="au-o-box au-o-box--small au-c-card au-c-card--fill">
      <div class="au-c-card__content">
        {{yield (hash Columns=CardColumns) to="card"}}

        {{#if @containsRequiredFields}}
          <AuHelpText @skin="secondary" class="au-u-margin-top">
            * Verplicht veld
          </AuHelpText>
        {{/if}}
      </div>
    </div>
  </div>
</template> satisfies TOC<EditCardSignature>;

interface CardColumnsSignature {
  Element: HTMLDivElement;
  Blocks: {
    left: [typeof CardItem];
    right: [typeof CardItem];
  };
}

const CardColumns = <template>
  <div class="au-c-card-columns" ...attributes>
    <div class="au-c-card-columns__column">
      {{yield CardItem to="left"}}
    </div>
    {{#if (has-block "right")}}
      <div class="au-c-card-columns__column">
        {{yield CardItem to="right"}}
      </div>
    {{/if}}
  </div>
</template> satisfies TOC<CardColumnsSignature>;

interface CardItemSignature {
  Args: {
    alignTop?: boolean;
    isGrid?: boolean;
    required?: boolean;
    errorMessage?: string;
    labelClass?: string;
    labelFor?: string;
  };
  Element: HTMLDivElement;
  Blocks: {
    label: [];
    content: [string | undefined];
  };
}

const CardItem = <template>
  <div
    class="au-c-card-item
      {{if @alignTop 'au-c-card-item--align-top'}}
      {{if @isGrid 'au-o-grid__item au-u-1-2@medium'}}"
    ...attributes
  >
    {{#if (has-block "label")}}
      <div class="au-c-card-item__label au-c-card-item__label--edit">
        <AuLabel
          @required={{@required}}
          @requiredLabel="*"
          @inline={{true}}
          @error={{if @errorMessage true}}
          class={{@labelClass}}
          for={{@labelFor}}
        >
          {{yield to="label"}}
        </AuLabel>
      </div>
    {{/if}}

    {{#if (has-block "content")}}
      <div
        class="au-c-card-item__content
          {{if (has-block 'label') '' 'au-c-card-item__content--offset'}}
          "
      >
        {{yield @errorMessage to="content"}}

        {{#if @errorMessage}}
          {{#if (has-block "error")}}
            {{yield @errorMessage to="error"}}
          {{else}}
            <AuHelpText @error={{true}}>{{@errorMessage}}</AuHelpText>
          {{/if}}
        {{/if}}

        {{#if (has-block "helpText")}}
          <AuHelpText @skin="tertiary">{{yield to="helpText"}}</AuHelpText>
        {{/if}}
      </div>
    {{/if}}
  </div>
</template> satisfies TOC<CardItemSignature>;
