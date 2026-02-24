// Copied from: https://github.com/lblod/ember-address-search/blob/788b2675a1267283c693c849f38d28a2ddefa95c/ember-address-search/src/services/address-register.ts
// TODO: remove this once the addon ships types
import Service from '@ember/service';

type SetupOptions = {
  endpoint: string;
};

export type Address = {
  uri?: string;
  addressRegisterId?: string;
  street?: string;
  housenumber: string;
  busNumber?: string; // Extra prop we need to add to the source
  zipCode: string;
  municipality: string;
  country: string;
  fullAddress: string;
};

export default class AddressRegisterService extends Service {
  setup(options: SetupOptions);
  // The return types have been updated to remove `null` since it doesn't really make sense
  suggest(fuzzyString: string): Promise<Address[]>;
  findAll(suggestion: Address): Promise<Address[]>;
  isEmpty(address: Partial<Address>): boolean;
}
