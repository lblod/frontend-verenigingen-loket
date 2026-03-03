import type { TOC } from '@ember/component/template-only';

interface TableMessageSignature {
  Blocks: {
    default: [];
  };
}

<template>
  <tbody class="table-message">
    <tr class="table-message__row">
      <td colspan="100%">
        <div
          class="au-o-layout au-u-margin-bottom-huge au-u-margin-top-huge au-u-text-center"
        >
          {{yield}}
        </div>
      </td>
    </tr>
  </tbody>
</template> satisfies TOC<TableMessageSignature>;
