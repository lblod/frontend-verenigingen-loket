import type { TOC } from '@ember/component/template-only';
import type { ComponentLike } from '@glint/template';

interface CardColumnsSignature {
  Args: {
    itemComponent?: ComponentLike;
  };
  Element: HTMLDivElement;
  Blocks: {
    left: [ComponentLike];
    right: [ComponentLike];
  };
}

<template>
  <div class="au-c-card-columns" ...attributes>
    <div class="au-c-card-columns__column">
      {{#if @itemComponent}}
        {{yield @itemComponent to="left"}}
      {{else}}
        {{yield to="left"}}
      {{/if}}
    </div>
    {{#if (has-block "right")}}
      <div class="au-c-card-columns__column">
        {{#if @itemComponent}}
          {{yield @itemComponent to="right"}}
        {{else}}
          {{yield to="right"}}
        {{/if}}
      </div>
    {{/if}}
  </div>
</template> satisfies TOC<CardColumnsSignature>;
