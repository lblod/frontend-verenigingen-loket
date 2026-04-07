import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class AssociationRepresentativesIndexController extends Controller {
  queryParams = ['sort'];
  @tracked sort = '';
}
