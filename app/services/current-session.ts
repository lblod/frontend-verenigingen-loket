import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
// TODO: replace this with our app's version once we can convert it to .ts (Vite, or switch to WarpDrive packages)
import type StoreService from 'ember-data/store';
import type Account from 'frontend-verenigingen-loket/models/account';
import type AdministrativeUnit from 'frontend-verenigingen-loket/models/administrative-unit';
import type AdministrativeUnitClassificationCode from 'frontend-verenigingen-loket/models/administrative-unit-classification-code';
import type User from 'frontend-verenigingen-loket/models/user';
import type SessionService from './session';

export default class CurrentSessionService extends Service {
  @service declare session: SessionService;
  @service declare store: StoreService;

  @tracked account?: Account;
  @tracked user?: User;
  /**
   * Is actually administrative unit associated with this user
   */
  @tracked group?: AdministrativeUnit;
  @tracked groupClassification?: AdministrativeUnitClassificationCode;
  @tracked roles: string[] = [];

  async load() {
    if (this.session.isAuthenticated) {
      const accountId =
        this.session.data.authenticated.relationships.account.data.id;
      this.account = await this.store.findRecord<Account>(
        'account',
        accountId,
        {
          include: 'user',
        },
      );
      this.user = await this.account.user;
      this.roles = this.session.data.authenticated.data.attributes.roles;

      const groupId =
        this.session.data.authenticated['relationships'].group.data.id;

      this.group = await this.store.findRecord<AdministrativeUnit>(
        'administrative-unit',
        groupId,
        {
          include: 'classification',
        },
      );
      this.groupClassification = await this.group.classification;
    }
  }
  get canEdit() {
    return true; // for demo purposes only -> change asap
  }

  get canEditVerenigingsregisterData() {
    // The securitySchemeUrl will be set once the administrative unit has a 'verwerkersovereenkomst' which allows them to edit data.
    return Boolean(this.group?.securitySchemeUrl);
  }

  get fullName() {
    if (!this.user) throw new Error('User not loaded.');
    return this.user.fullName;
  }

  get groupClassificationLabel() {
    if (!this.group) throw new Error('Group (administrative unit) not loaded');
    if (!this.groupClassification)
      throw new Error('Group classification not loaded');
    return this.groupClassification.label;
  }
}
