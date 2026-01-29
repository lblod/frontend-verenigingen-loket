import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { Type } from '@warp-drive/core-types/symbols';
import type ContactPoint from './contact-point';
import type Site from './site';

export default class PersonModel extends Model {
  declare [Type]: 'person';

  @attr declare givenName?: string;
  @attr declare familyName?: string;

  @belongsTo<Site>('site', { inverse: null, async: true })
  declare site: Promise<Site>;

  @hasMany<ContactPoint>('contact-point', { inverse: null, async: true })
  declare contactPoints: Promise<ContactPoint[]>;
}

