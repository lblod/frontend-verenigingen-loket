import Component from '@glimmer/component';
import config from 'frontend-verenigingen-loket/config/environment';

export default class AnnouncementBanner extends Component {
  get shouldShowBanner() {
    return !config.announcementMessage.startsWith('{{');
  }

  get message() {
    return config.announcementMessage;
  }
}
