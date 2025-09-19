import Model, { attr } from '@ember-data/model';
import type { Type } from '@warp-drive/core-types/symbols';

export const CONCEPT_SCHEME = {
  ACTIVITIES: '6c10d98a-9089-4fe8-ba81-3ed136db0265',
};

export default class ConceptModel extends Model {
  declare [Type]: 'concept';

  @attr declare prefLabel?: string;
  @attr declare notation?: string;
}
