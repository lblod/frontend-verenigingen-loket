import Component from '@glimmer/component';

export default class StaticPageComponent extends Component {
  get host() {
    return window.location.host;
  }
}
