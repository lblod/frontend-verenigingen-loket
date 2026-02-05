import { assert } from '@ember/debug';
import Model, { attr, hasMany, belongsTo } from '@ember-data/model';
import { Type } from '@warp-drive/core-types/symbols';
// @ts-expect-error Class isn't typed yet.
import type Activity from './activity';
import type Identifier from './identifier';
import type Membership from './membership';
import type Site from './site';
import type ContactPoint from './contact-point';
// @ts-expect-error Class isn't typed yet.
import type OrganizationStatusCode from './organization-status-code';
// @ts-expect-error Class isn't typed yet.
import type ChangeEvent from './change-event';
import type Concept from './concept';
// @ts-expect-error Class isn't typed yet.
import type TargetAudience from './target-audience';
// @ts-expect-error Class isn't typed yet.
import type Recognition from './recognition';

export default class Association extends Model {
  declare [Type]: 'association';

  @attr declare name?: string;
  @attr declare description?: string;
  @attr declare lastUpdated?: string;
  @attr declare createdOn?: string;
  @attr declare etag?: string;
  @attr recognitionStatus?: string;

  @hasMany<Identifier>('identifier', { inverse: null, async: true })
  declare identifiers: Promise<Identifier[]>;

  @hasMany<Site>('site', { inverse: null, async: true }) declare sites: Promise<
    Site[]
  >;

  @belongsTo<Site>('site', { inverse: null, async: true })
  declare primarySite: Promise<Site>;

  @hasMany<ContactPoint>('contact-point', {
    inverse: 'organization',
    async: true,
  })
  declare contactPoints: Promise<ContactPoint[]>;

  @belongsTo<OrganizationStatusCode>('organization-status-code', {
    inverse: null,
    async: true,
  })
  declare organizationStatus: Promise<OrganizationStatusCode>;

  @hasMany<Activity>('activity', { inverse: null, async: true })
  declare activities: Promise<Activity[]>;

  @hasMany<Membership>('membership', { inverse: null, async: true })
  declare members: Promise<Membership[]>;

  @hasMany<ChangeEvent>('change-event', { inverse: null, async: true })
  declare changeEvents: Promise<ChangeEvent[]>;

  @belongsTo<Concept>('concept', { inverse: null, async: true })
  declare classification: Promise<Concept>;

  @belongsTo<TargetAudience>('target-audience', { inverse: null, async: true })
  declare targetAudience: Promise<TargetAudience>;

  @hasMany<Recognition>('recognition', { inverse: 'association', async: true })
  declare recognitions: Promise<Recognition[]>;
}

export async function associationVCode(association: Association) {
  const identifiers = await association.identifiers;
  const vCodeIdentifier = identifiers.find((identifier: Identifier) => {
    return identifier.idName === 'vCode';
  });

  assert('Each association should have a vCode', vCodeIdentifier);

  const structuredIdentifier = await vCodeIdentifier.structuredIdentifier;
  return structuredIdentifier.localId;
}
