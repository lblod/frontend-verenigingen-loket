import type { TOC } from '@ember/component/template-only';
import { pageTitle } from 'ember-page-title';

interface SpreadsheetRequestReasonSignature {
  Args: {
    model: unknown;
    controller: unknown;
  };
}

<template>
  {{pageTitle "Spreadsheet aanvragen"}}

  {{outlet}}
</template> satisfies TOC<SpreadsheetRequestReasonSignature>;
