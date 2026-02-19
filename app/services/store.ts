import { useLegacyStore } from '@warp-drive/legacy';
import { JSONAPICache } from '@warp-drive/json-api';

const Store = useLegacyStore({
  legacyRequests: true,
  linksMode: false,
  cache: JSONAPICache,
  handlers: [
    // -- your handlers here
  ],
  schemas: [
    // -- your schemas here
  ],
});

type Store = InstanceType<typeof Store>;

export default Store;

// Don't remove this declaration: this is what enables TypeScript to resolve
// this service using `Owner.lookup('service:sensitive-data')`, as well
// as to check when you pass the service name as an argument to the decorator,
// like `@service('sensitive-data') declare altName: SensitiveDataService;`.
declare module '@ember/service' {
  interface Registry {
    store: Store;
  }
}
