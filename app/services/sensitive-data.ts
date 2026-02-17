import { assert } from '@ember/debug';
import Service from '@ember/service';
import type Association from 'frontend-verenigingen-loket/models/association';
import type Concept from 'frontend-verenigingen-loket/models/concept';

/**
 * A simple service that keeps track of which associations still requires the user
 * to provide a reason to access the sensitive data.
 */
export default class SensitiveDataService extends Service {
  private requestReasons = new Map<Association, Concept>();

  hasProvidedReason(association: Association): boolean {
    return this.requestReasons.has(association);
  }

  requiresReason(association: Association): boolean {
    return !this.hasProvidedReason(association);
  }

  provideReason(association: Association, concept: Concept): void {
    this.requestReasons.set(association, concept);
  }

  getReason(association: Association): Concept {
    const reason = this.requestReasons.get(association);

    assert(
      '`getReason` was used before a reason was provided with `provideReason`',
      reason,
    );

    return reason;
  }
}

// Don't remove this declaration: this is what enables TypeScript to resolve
// this service using `Owner.lookup('service:sensitive-data')`, as well
// as to check when you pass the service name as an argument to the decorator,
// like `@service('sensitive-data') declare altName: SensitiveDataService;`.
declare module '@ember/service' {
  interface Registry {
    'sensitive-data': SensitiveDataService;
  }
}
