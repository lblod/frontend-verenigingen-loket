import { assert } from '@ember/debug';
import RequestManager from '@ember-data/request';
import Fetch from '@ember-data/request/fetch';
import { associationVCode } from 'frontend-verenigingen-loket/models/association';
import type Association from 'frontend-verenigingen-loket/models/association';
import type ContactPoint from 'frontend-verenigingen-loket/models/contact-point';
import type { ChangedAttributesHash } from '@warp-drive/core-types/cache';
import type Site from 'frontend-verenigingen-loket/models/site';
import { isValidRijksregisternummer } from 'frontend-verenigingen-loket/utils/rijksregisternummer';
import type TrackedData from 'frontend-verenigingen-loket/utils/tracked-data';
import Joi from 'joi';

const manager = new RequestManager().use([Fetch]);

export async function isApiAvailable(association: Association) {
  try {
    const url = await buildVerenigingUrl(association);
    await manager.request({
      url,
    });

    return true;
  } catch {
    return false;
  }
}

export async function isOutOfDate(association: Association) {
  const currentEtag = association.etag;
  if (typeof currentEtag !== 'string') {
    // If the etag isn't a string, we assume it was harvested incorrectly and we can't be sure the data is out of date.
    return false;
  }

  const latestEtag = await getLatestEtag(association);
  return currentEtag !== latestEtag;
}

export async function getLatestEtag(association: Association) {
  const url = await buildVerenigingUrl(association);
  const dataDocument = await manager.request({
    url,
  });

  const etag = dataDocument.response?.headers?.get('etag');
  return etag;
}

// These types aren't complete. The API contains more info, but we only type what is useful to keep things simple.
type Vereniging = {
  vCode: string;
  naam: string;
  korteNaam: string;
  korteBeschrijving: string;
  startdatum: string;
  einddatum: string;
  status: string;
  vertegenwoordigers?: Vertegenwoordiger[];
};

// A representative in English. We use dutch naming here since it's a verenigingsregister object that also uses dutch property names.
export type Vertegenwoordiger = {
  vertegenwoordigerId?: number;
  voornaam?: string;
  achternaam?: string;
  roepnaam?: string;
  insz?: string;
  'e-mail'?: string;
  telefoon?: string;
  socialMedia?: string;
  isPrimair?: boolean;
} & {
  // Not a real property, but we use it to store generic errors for now.
  genericError?: string;
};

type VerenigingDetailsResponse = {
  vereniging: Vereniging;
  metadata: {
    datumLaatsteAanpassing: string;
  };
};

// 400 errors
// Based on the documentation here: https://beheer.verenigingen.vlaanderen.be/docs/api-documentation.html#tag/Decentraal-beheer-van-verenigingen/paths/~1v1~1verenigingen~1{vCode}~1vertegenwoordigers~1{vertegenwoordigerId}/patch
// The actual responses don't fully match that though (they only document the nested "details" object), which might be a mistake in the documentation.
type ApiErrorResponse = {
  error: string;
  details: {
    type: string;
    title: string;
    detail: string;
    status: number;
    instance: string;
    validationErrors?: Record<
      string, // property name, but it doesn't 100% match the actual properties
      {
        code: string;
        reason: string;
      }[]
    >;
  };
};

export async function getVertegenwoordigers(
  association: Association,
): Promise<Vertegenwoordiger[]> {
  const url = await buildVerenigingUrl(association);
  const dataDocument = await manager.request<VerenigingDetailsResponse>({
    url,
  });

  return (
    dataDocument.content.vereniging.vertegenwoordigers?.map(
      (vertegenwoordiger) => {
        // We only return the data we actually need. The API responds with more (nested) data.
        return {
          vertegenwoordigerId: vertegenwoordiger.vertegenwoordigerId,
          voornaam: vertegenwoordiger.voornaam,
          achternaam: vertegenwoordiger.achternaam,
          'e-mail': vertegenwoordiger['e-mail'],
          telefoon: vertegenwoordiger.telefoon,
          socialMedia: vertegenwoordiger.socialMedia,
          isPrimair: vertegenwoordiger.isPrimair,
        };
      },
    ) || []
  );
}

/**
 * After writing to the API it is possible that the read requests are temporarily out of date due to its architecture.
 * The API provides a mechanism where the `expectedSequence` can be provided to verify that the data is up-to-date. If it isn't we have to wait a bit before trying again.
 * More information: https://vlaamseoverheid.atlassian.net/wiki/spaces/MG/pages/6564610476/Veel+gestelde+vragen+Verenigingsregister#expectedSequence-en-ETag
 */
export async function waitForStableAPI() {
  function wait(delay = 0) {
    return new Promise((resolve) => {
      setTimeout(resolve, delay);
    });
  }

  // Instead of using the expectedSequence feature we just always wait a certain amount of time to keep things simple.
  // A delay of 1 second should be more than enough and isn't really noticeable by the user.
  return wait(1000);
}

export async function createOrUpdateContactDetail(contactPoint: ContactPoint) {
  const url = await buildContactDetailUrl(contactPoint);
  const method = contactPoint.isNew ? 'POST' : 'PATCH';

  await manager.request({
    url,
    method,
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({
      contactgegeven: mapRecordAttributesToAPIFields(
        contactPoint.changedAttributes(),
        CONTACT_DETAILS_ATTRIBUTE_MAP,
      ),
    }),
  });
}

export async function removeContactDetail(contactPoint: ContactPoint) {
  const url = await buildContactDetailUrl(contactPoint);

  await manager.request({
    url,
    method: 'DELETE',
  });
}

export async function createOrUpdateCorrespondenceSite(
  site: Site,
  association: Association,
) {
  const url = await buildSiteUrl(site, association);
  const method = site.isNew ? 'POST' : 'PATCH';
  const address = await site.address;
  const locationBody: Record<string, unknown> = {};

  if (site.isNew) {
    locationBody['locatietype'] = 'Correspondentie';
  }

  // "adresId" and "adres" are mutually exclusive.
  // The verenigingsregister API will automatically fetch the address information when we provide the address register URI.
  if (address.addressRegisterUri) {
    locationBody['adresId'] = {
      broncode: 'AR',
      bronwaarde: address.addressRegisterUri,
    };
  } else {
    // It seems we need to send _all_ the address values, even if only a single thing changes,
    // so we can't use the .changedAttributes and mapRecordAttributesToApiFields setup here
    locationBody['adres'] = {
      straatnaam: address.street,
      huisnummer: address.number,
      busnummer: address.boxNumber,
      postcode: address.postcode,
      gemeente: address.municipality,
      land: address.country,
    };
  }

  await manager.request({
    url,
    method,
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({ locatie: locationBody }),
  });
}

export async function removeCorrespondenceSite(
  site: Site,
  association: Association,
) {
  const url = await buildSiteUrl(site, association);

  await manager.request({
    url,
    method: 'DELETE',
  });
}

export async function createOrUpdateVertegenwoordiger(
  vertegenwoordiger: TrackedData<Vertegenwoordiger>,
  association: Association,
) {
  const url = await buildVertegenwoordigerUrl(
    vertegenwoordiger.data,
    association,
    vertegenwoordiger.isNew,
  );
  const method = vertegenwoordiger.isNew ? 'POST' : 'PATCH';

  const requestData: Partial<
    Record<keyof Vertegenwoordiger, Vertegenwoordiger[keyof Vertegenwoordiger]>
  > = {};

  for (const value of vertegenwoordiger.changedValues) {
    requestData[value] = vertegenwoordiger.data[value];
  }

  try {
    await manager.request({
      url,
      method,
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        vertegenwoordiger: requestData,
      }),
    });
  } catch (error) {
    // TODO: use the correct error type, not sure if WarpDrive exports this
    // @ts-expect-error: Find out where to get proper types for this error: https://github.com/warp-drive-data/warp-drive/blob/7f899457cea393b233b86a4d92c9f5bd4a51ea76/warp-drive-packages/core/src/request/-private/fetch.ts#L249-L258
    if (error instanceof Error && error.status === 400) {
      // @ts-expect-error: missing error types
      const apiError = error.content as ApiErrorResponse;
      if (apiError.details) {
        // All "detail" values seem to contain a `Source: ` prefix, which we don't want to show to users..
        const errorMessage = apiError.details.detail.replace('Source: ', '');

        // This is a very naive check, but there doesn't seem to be anything else in the response that we could otherwise use to map it to the field..
        if (errorMessage.toLowerCase().includes('insz')) {
          vertegenwoordiger.addError('insz', errorMessage);
        } else {
          vertegenwoordiger.addError('genericError', errorMessage);
        }
      }
      throw new ApiValidationError(vertegenwoordiger);
    } else {
      throw error;
    }
  }
}

export async function removeVertegenwoordiger(
  vertegenwoordiger: Vertegenwoordiger,
  association: Association,
) {
  const url = await buildVertegenwoordigerUrl(vertegenwoordiger, association);

  await manager.request({
    url,
    method: 'DELETE',
  });
}

async function buildContactDetailUrl(contactPoint: ContactPoint) {
  const association = contactPoint.organization;

  assert(
    'association contact points are expected to have an association relationship',
    association,
  );

  const url = (await buildVerenigingUrl(association)) + '/contactgegevens';

  if (!contactPoint.isNew) {
    const internalId = contactPoint.internalId;
    assert(
      'existing contact points are expected to have an internal id',
      internalId,
    );

    if (internalId) {
      return url + '/' + internalId;
    }
  }

  return url;
}

async function buildSiteUrl(site: Site, association: Association) {
  const url = (await buildVerenigingUrl(association)) + '/locaties';

  if (!site.isNew) {
    const internalId = site.internalId;
    assert('existing sites are expected to have an internal id', internalId);

    if (internalId) {
      return url + '/' + internalId;
    }
  }

  return url;
}

async function buildVertegenwoordigerUrl(
  vertegenwoordiger: Vertegenwoordiger,
  association: Association,
  isNew: boolean = false,
) {
  const url = (await buildVerenigingUrl(association)) + '/vertegenwoordigers';

  if (!isNew) {
    const id = vertegenwoordiger.vertegenwoordigerId;
    assert(
      'existing vertegenwoordigers are expected to have a "vertegenwoordigerId"',
      id,
    );

    if (id) {
      return url + '/' + id;
    }
  }

  return url;
}

async function buildVerenigingUrl(association: Association) {
  const vCode = await associationVCode(association);
  return `/verenigingen-proxy/${vCode}`;
}

const CONTACT_DETAILS_ATTRIBUTE_MAP = {
  name: 'contactgegeventype',
  telephone: 'waarde',
  email: 'waarde',
  website: 'waarde',
  type: function (
    typeValue: unknown,
    mappedAttributes: Record<string, unknown>,
  ) {
    mappedAttributes['isPrimair'] = typeValue === 'Primary';
  },
};

/**
 * The verenigingsregister API uses different field names than our mu-cl-resources API, so we need to map between them.
 * @param attributes: The hash of changed attributes
 * @param attributeMap: The object that maps the EmberData attribute names to the corresponding API field. It can also be a function if the mapped value needs to be changed as well.
 * @returns
 */
function mapRecordAttributesToAPIFields<T>(
  attributes: ChangedAttributesHash,
  attributeMap: AttributeMap<T>,
  ignoredAttributes?: (keyof T)[],
): Record<string, unknown> {
  const mappedAttributes: Record<string, unknown> = {};

  Object.keys(attributes).forEach((attribute) => {
    // TODO: there might be a way to type this properly without the type assertion?
    const mappedAttributeOrHandler = attributeMap[attribute as keyof T];

    if (
      Array.isArray(ignoredAttributes) &&
      ignoredAttributes.includes(attribute as keyof T)
    ) {
      return;
    }

    assert(
      `Map is missing for attribute "${attribute}"`,
      mappedAttributeOrHandler,
    );

    if (typeof mappedAttributeOrHandler === 'function') {
      const newValue = attributes[attribute]?.at(1);
      mappedAttributeOrHandler(newValue, mappedAttributes);
    } else if (typeof mappedAttributeOrHandler === 'string') {
      mappedAttributes[mappedAttributeOrHandler] = attributes[attribute]?.at(1);
    }
  });

  return mappedAttributes;
}

type AttributeMap<T> = {
  [K in keyof T]?:
    | string
    | ((value: unknown, mapped: Record<string, unknown>) => void);
};

export function handleError(
  toaster: { error: (message: string, title?: string) => void },
  error: Error,
) {
  toaster.error(
    'Er ging iets fout bij het verzenden van de gegevens naar het Verenigingsregister.',
  );
  logAPIError(error);
}

export function logAPIError(error: Error, message?: string) {
  if (message) {
    console.error(message, error, JSON.stringify(error));
  } else {
    console.error(error, JSON.stringify(error));
  }
}

const nameSchema = Joi.string()
  .trim()
  .empty('')
  .required()
  .pattern(/^[^0-9]*$/) // No numbers allowed
  .messages({
    'string.pattern.base': 'Dit veld mag geen cijfers bevatten.',
  });

export const vertegenwoordigerValidationSchema = Joi.object({
  voornaam: nameSchema,
  achternaam: nameSchema,
  insz: Joi.string()
    .empty('')
    .when('$isNew', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .custom((value: string, helpers: Joi.CustomHelpers<string>) => {
      if (!isValidRijksregisternummer(value)) {
        return helpers.error('string.invalid-ssn');
      }

      return value;
    })
    .messages({
      'string.invalid-ssn': 'Geen geldig rijksregisternummer.',
    }),
  'e-mail': Joi.string().empty('').email({ tlds: false }).required().messages({
    'string.email': 'Geef een geldig e-mailadres in.',
  }),
  telefoon: Joi.string()
    .empty('')
    .regex(/^(tel:)?\+?[0-9]*$/)
    .optional()
    .messages({
      'string.pattern.base': 'Enkel een plusteken en cijfers zijn toegelaten.',
    }),
  socialMedia: Joi.string()
    .empty('')
    .uri()
    .optional()
    .messages({ 'string.uri': 'Geef een geldig internetadres in.' }),
}).messages({
  'any.required': 'Dit veld is verplicht.',
});

export class ApiValidationError<T> extends Error {
  subject: T;
  name: string;

  constructor(subject: T) {
    super('API Validation error');
    this.name = 'ApiValidationError';
    this.subject = subject;
  }
}
