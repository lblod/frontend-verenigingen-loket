import {
  setComponentManager,
  setComponentTemplate,
  capabilities,
} from '@ember/component';
import { tracked } from '@glimmer/tracking';
import { hbs } from 'ember-cli-htmlbars';

// This implements a "{{#key}}" component which works similar to the `{#key}` logic block in Svelte: https://svelte.dev/docs/logic-blocks#key
// Based on the pattern described in this video: https://www.youtube.com/watch?v=sWGyJR6P-V0&t=1053s
// Code comes from this Discord discussion: https://discord.com/channels/480462759797063690/1098219236788285510/1098290701181128825
export default setComponentManager(
  () => ({
    capabilities: capabilities('3.13', { updateHook: true }),
    createComponent(Key, args) {
      return this.updateComponent(new Key(), args);
    },
    updateComponent(instance, args) {
      instance.value = [args.positional[0]];
      return instance;
    },
    getContext(instance) {
      return instance;
    },
  }),
  setComponentTemplate(
    hbs`{{#each this.value}}{{yield}}{{/each}}`,
    class Key {
      @tracked value;
    },
  ),
);
