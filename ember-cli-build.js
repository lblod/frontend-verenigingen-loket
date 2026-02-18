'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = async function (defaults) {
  const app = new EmberApp(defaults, {
    babel: {
      plugins: [
        require.resolve('ember-concurrency/async-arrow-task-transform'),
      ],
    },
    'ember-cli-babel': { enableTypeScriptTransform: true },

    // Add options here
  });

  const { setConfig } = await import('@warp-drive/build-config');
  setConfig(app, __dirname, {
    // this should be the most recent <major>.<minor> version for
    // which all deprecations have been fully resolved
    // and should be updated when that changes
    // compatWith: '5.8',
    deprecations: {
      // New projects can safely leave this deprecation disabled.
      // If upgrading, to opt-into the deprecated behavior, set this to true and then follow:
      // https://deprecations.emberjs.com/id/ember-data-deprecate-store-extends-ember-object
      // before upgrading to Ember Data 6.0
      DEPRECATE_STORE_EXTENDS_EMBER_OBJECT: false,
      DEPRECATE_TRACKING_PACKAGE: false,
    },
  });

  const { Webpack } = require('@embroider/webpack');
  return require('@embroider/compat').compatBuild(app, Webpack, {
    staticAddonTestSupportTrees: true,
    staticAddonTrees: true,
    staticEmberSource: true,
    staticInvokables: true,
    skipBabel: [
      {
        package: 'qunit',
      },
    ],
  });
};
