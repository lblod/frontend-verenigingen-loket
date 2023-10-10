import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class IndexController extends Controller {
  @tracked page = 0;
  @tracked size = 20;
  @tracked sort = 'name';

  getVcode(identifier) {
    if (identifier.idName === 'vCode') {
      return identifier.structuredIdentifier.get('localId');
    }
  }
}
