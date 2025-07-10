import Application from 'frontend-verenigingen-loket/app';
import ENV from 'frontend-verenigingen-loket/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { loadTests } from 'ember-qunit/test-loader';
import { start, setupEmberOnerrorValidation } from 'ember-qunit';

setApplication(Application.create(ENV.APP));

setup(QUnit.assert);
setupEmberOnerrorValidation();
loadTests();
start();
