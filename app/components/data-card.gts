import AuHeading, {
  type AuHeadingSignature,
} from '@appuniversum/ember-appuniversum/components/au-heading';
import type { TOC } from '@ember/component/template-only';
import { hash } from '@ember/helper';
import type { ComponentLike } from '@glint/template';

interface DataCardSignature {
  Args: {
    headingLevel?: AuHeadingSignature['Args']['level'];
    headingSkin?: AuHeadingSignature['Args']['skin'];
  };
  Element: HTMLDivElement;
  Blocks: {
    title: [];
    card: [{ Columns: ComponentLike }];
  };
}
<template>
  <div ...attributes>
    {{#if (has-block "title")}}
      <AuHeading
        @level={{if @headingLevel @headingLevel "3"}}
        @skin={{if @headingSkin @headingSkin "5"}}
        class="au-u-margin-bottom-tiny"
      >
        {{yield to="title"}}
      </AuHeading>
    {{/if}}

    <dl class="au-o-box au-o-box--small au-c-card au-c-card--data">
      <div class="au-c-card__content">
        {{yield (hash Columns=CardColumns) to="card"}}
      </div>
    </dl>
  </div>
</template> satisfies TOC<DataCardSignature>;

interface CardColumnsSignature {
  Element: HTMLDivElement;
  Blocks: {
    left: [ComponentLike];
    right: [ComponentLike];
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
  };
  Blocks: {
    label: [];
    content: [];
  };
}

const CardItem = <template>
  <div
    class="au-c-card-item
      {{if @alignTop 'au-c-card-grid-item--align-top'}}
      {{if @isGrid 'au-o-grid__item au-u-1-2@medium'}}"
    ...attributes
  >
    {{#if (has-block "label")}}
      <dt class="au-c-card-item__label au-c-card-item__label--data">
        {{yield to="label"}}
      </dt>
    {{/if}}

    {{#if (has-block "content")}}
      <dd
        class="au-c-card-item__content au-u-word-break
          {{if (not (has-block 'label')) 'au-c-card-item__content--offset'}}
          "
      >
        {{yield to="content"}}
      </dd>
    {{/if}}
  </div>
</template> satisfies TOC<CardItemSignature>;

function not(value: boolean) {
  return !value;
}
