import type { ControllerQueryParam } from '@ember/controller';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class AssociationLocationController extends Controller {
  queryParams: readonly ControllerQueryParam[] = ['sort'];
  @tracked sort: string = '';
}
