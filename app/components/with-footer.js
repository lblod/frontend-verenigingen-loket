import Component from '@glimmer/component';

export default class WithFooterComponent extends Component {
  get host() {
    return window.location.host;
  }
}
