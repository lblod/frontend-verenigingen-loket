import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class AssociationContactDetailsIndexController extends Controller {
  queryParams = ['page', 'size', 'sort'];
  @tracked page = 0;

  // We might need to change this once the DB contains both `Primary` and `Secondary` values for the types field.
  // At the moment, we assume that only `Primary` is used is stored in the DB, so we use `-type` to show the records without a type last.
  @tracked sort = '-type,name';
  size = 20;
}
