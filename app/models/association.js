import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class AssociationModel extends Model {
  @attr name;
  @attr description;
  @attr lastUpdated;
  @hasMany('identifier', { inverse: null, async: true }) identifiers;
  @hasMany('site', { inverse: null, async: true }) sites;
  @belongsTo('site', { inverse: null, async: true }) primarySite;
  @hasMany('contact-point', { inverse: null, async: true }) contactPoints;
  @belongsTo('organization', { inverse: null, async: true })
  parentOrganization;
  @belongsTo('organization-status-code', { inverse: null, async: true })
  organizationStatus;
  @hasMany('activity', { inverse: null, async: true }) activities;
  @hasMany('membership', { inverse: null, async: true }) members;
  @hasMany('change-event', { inverse: null, async: true }) changeEvents;
  @belongsTo('concept', { inverse: null, async: true })
  classification;
  @belongsTo('target-audience', { inverse: null, async: true })
  targetAudience;
  @hasMany('recognition', { inverse: null, async: true })
  recognitions;
}
