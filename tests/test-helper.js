import Application from 'frontend-verenigingen-loket/app';
import ENV from 'frontend-verenigingen-loket/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start } from 'ember-qunit';

setApplication(Application.create(ENV.APP));

setup(QUnit.assert);

start();
