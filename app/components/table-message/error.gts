import AuLinkExternal from '@appuniversum/ember-appuniversum/components/au-link-external';
import TableMessage from '../table-message';

<template>
  {{! Generic error message }}
  <TableMessage>
    <p>
      <strong class="au-u-medium">Er is een fout opgetreden.</strong><br />
      <br />
      Sorry, er ging iets mis. We hebben uw verzoek niet kunnen verwerken.
      Probeer de pagina te herladen. Indien het nog steeds niet lukt, neem
      rechtstreeks contact op via mail
      <AuLinkExternal
        href="mailto:ict.helpdesk.abb@vlaanderen.be"
      >ict.helpdesk.abb@vlaanderen.be</AuLinkExternal>.
    </p>
  </TableMessage>
</template>
