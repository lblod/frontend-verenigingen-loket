// Set up inspector support in v6.1+ Embroidered apps
// Source: https://github.com/emberjs/ember-inspector/issues/2612#issuecomment-2582258343
// TODO: remove this once there is a better solution available
import Ember from 'ember';
import * as runtime from '@glimmer/runtime';
import * as tracking from '@glimmer/tracking';
import * as validator from '@glimmer/validator';
import * as reference from '@glimmer/reference';
import { RSVP } from '@ember/-internals/runtime';

import config from 'frontend-verenigingen-loket/config/environment';

window.define('@glimmer/tracking', () => tracking);
window.define('@glimmer/runtime', () => runtime);
window.define('@glimmer/validator', () => validator);
window.define('@glimmer/reference', () => reference);
window.define('rsvp', () => RSVP);
window.define('ember', () => ({ default: Ember }));
window.define('frontend-verenigingen-loket/config/environment', () => ({
  default: config,
}));
