import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuHelpText from '@appuniversum/ember-appuniversum/components/au-help-text';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import CardColumns from './card-columns';
import { hash } from '@ember/helper';

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
        {{yield
          (hash Columns=(component CardColumns itemComponent=CardItem))
          to="card"
        }}

        {{#if @containsRequiredFields}}
          <AuHelpText @skin="secondary" class="au-u-margin-top">
            * Verplicht veld
          </AuHelpText>
        {{/if}}
      </div>
    </div>
  </div>
</template>

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
          @error={{@errorMessage}}
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
</template>;
