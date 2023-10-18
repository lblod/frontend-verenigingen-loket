import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class HeaderComponent extends Component {
  @service() session;
  @service() currentSession;
}
