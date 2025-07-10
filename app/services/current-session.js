import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CurrentSessionService extends Service {
  @service session;
  @service store;

  @tracked account;
  @tracked user;
  /**
   * Is actually administrative unit associated with this user
   */
  @tracked group;
  @tracked groupClassification;
  @tracked roles = [];

  async load() {
    if (this.session.isAuthenticated) {
      let accountId =
        this.session.data.authenticated.relationships.account.data.id;
      this.account = await this.store.findRecord('account', accountId, {
        include: 'user',
      });
      this.user = await this.account.user;
      this.roles = this.session.data.authenticated.data.attributes.roles;

      let groupId = this.session.data.authenticated.relationships.group.data.id;
      this.group = await this.store.findRecord('administrative-unit', groupId, {
        include: 'classification',
      });
      this.groupClassification = await this.group.classification;
    }
  }
  get canEdit() {
    return true; // for demo purposes only -> change asap
  }

  get fullName() {
    if (!this.user) throw new Error('User not loaded.');
    return this.user.fullName;
  }

  get groupClassificationLabel() {
    if (!this.group) throw new Error('Group (aministrative unit) not loaded');
    if (!this.groupClassification)
      throw new Error('Group classification not loaded');
    return this.groupClassification.label;
  }
}
