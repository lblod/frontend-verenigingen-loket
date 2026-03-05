import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class AssociationContactDetailsIndexController extends Controller {
  queryParams = ['sort'];

  @tracked sort = 'is-primair,contactgegeventype';
}
