import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';

<template>
  <AuAlert
    @skin="warning"
    @icon="alert-triangle"
    @size="small"
    @closable={{true}}
    class="au-u-max-width-small"
    ...attributes
  >
    Na een aanpassing kan het even duren voor de veranderingen hier zichtbaar
    zijn.
    <br />
    Wees gerust, de veranderingen zijn vrijwel meteen zichtbaar in het
    Verenigingsregister.
  </AuAlert>
</template>
