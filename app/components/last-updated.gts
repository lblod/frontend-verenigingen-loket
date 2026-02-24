import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import type { TOC } from '@ember/component/template-only';
import dateFormat from 'frontend-verenigingen-loket/helpers/date-format';

interface LastUpdatedSignature {
  Args: {
    lastUpdated?: string;
  };
}

<template>
  <AuPill @icon="clock-rewind">Laatst gewijzigd
    {{#if (dateFormat @lastUpdated)}}
      op
      {{dateFormat @lastUpdated}}
    {{else}}
      is niet opgegeven.
    {{/if}}
  </AuPill>
</template> satisfies TOC<LastUpdatedSignature>;
