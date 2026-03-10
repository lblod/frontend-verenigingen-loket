import { assert } from '@ember/debug';
import { Fetch, RequestManager } from '@warp-drive/core';
import type { RequestInfo } from '@warp-drive/core/types/request';
import { associationVCode } from 'frontend-verenigingen-loket/models/association';
import type Association from 'frontend-verenigingen-loket/models/association';
import type Concept from 'frontend-verenigingen-loket/models/concept';
import { isValidRijksregisternummer } from 'frontend-verenigingen-loket/utils/rijksregisternummer';
import type TrackedData from 'frontend-verenigingen-loket/utils/tracked-data';
import Joi from 'joi';

const manager = new RequestManager().use([Fetch]);

////////////////////////////////////////////////////////////////////////////
/// Types
////////////////////////////////////////////////////////////////////////////

// These types aren't complete. The API contains more info, but we only type what is useful to keep things simple.
type Vereniging = {
  vCode: string;
  naam: string;
  korteNaam: string;
  korteBeschrijving: string;
  startdatum: string;
  einddatum: string;
  status: string;
  locaties?: Locatie[];
  contactgegevens?: Contactgegeven[];
  vertegenwoordigers?: Vertegenwoordiger[];
};

export type LocatieType = 'Correspondentie' | 'Activiteiten';
export type Locatie = {
  locatietype: LocatieType;
  locatieId: number;
  naam?: string;
  adresvoorstelling: string;
  adresId?: AdresIdentifier;
  adres: Adres;
  isPrimair: boolean;
};

export type AdresIdentifier = {
  bronwaarde: string;
  broncode: 'AR';
};

export type Adres = {
  straatnaam: string;
  huisnummer: string;
  busnummer?: string;
  postcode: string;
  gemeente: string;
  land: string;
};

export type ContactgegevenType =
  | 'Telefoon'
  | 'E-mail'
  | 'Website'
  | 'SocialMedia';

export type Contactgegeven = {
  contactgegevenId: number;
  contactgegeventype: ContactgegevenType;
  waarde: string;
  isPrimair: boolean;
};

// A representative in English. We use dutch naming here since it's a verenigingsregister object that also uses dutch property names.
// TODO: remove undefined from some of these props. Some are optional, but we mainly did it for the edit page. We should use a separate type for that (with optional fields)
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
  // TODO: This is only relevant for the edit page, we shouldn't add it here.
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

////////////////////////////////////////////////////////////////////////////
// Constants
////////////////////////////////////////////////////////////////////////////

export const CONTACTGEGEVEN_LABEL: Record<ContactgegevenType, string> = {
  'E-mail': 'E-mail',
  Telefoon: 'Telefoonnummer',
  Website: 'Website',
  SocialMedia: 'Social media',
};

////////////////////////////////////////////////////////////////////////////
// Status checking
////////////////////////////////////////////////////////////////////////////

export async function isApiAvailable(association: Association) {
  try {
    const vCode = await associationVCode(association);
    const url = buildVerenigingUrl(vCode);
    await manager.request({
      url,
      method: 'HEAD',
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
  const vCode = await associationVCode(association);
  const url = buildVerenigingUrl(vCode);
  const dataDocument = await manager.request({
    url,
    method: 'HEAD',
  });

  const etag = dataDocument.response?.headers?.get('etag');
  return etag;
}

export async function hasApiAuthorization(
  association: Association,
): Promise<boolean> {
  const vCode = await associationVCode(association);
  const url = buildVerenigingUrl(vCode) + '/authorization-check';
  try {
    await manager.request({
      url,
    });

    return true;
  } catch {
    return false;
  }
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

////////////////////////////////////////////////////////////////////////////
// Data fetching
////////////////////////////////////////////////////////////////////////////

export async function getVerenigingDetails(
  association: Association,
  reasonId?: string,
) {
  const vCode = await associationVCode(association);
  const url = reasonId
    ? buildVerenigingUrl(vCode)
    : buildBasisInformatieUrl(vCode);

  const requestInfo: RequestInfo<VerenigingDetailsResponse> = {
    url,
  };

  if (reasonId) {
    requestInfo.headers = new Headers({
      'X-Request-Reason': reasonId,
    });
  }

  const dataDocument =
    await manager.request<VerenigingDetailsResponse>(requestInfo);

  return dataDocument.content;
}

export function getLocatiesFromVereniging(vereniging: Vereniging): Locatie[] {
  return vereniging.locaties || [];
}

export function findCorrespondenceLocatie(
  locaties: Locatie[],
): Locatie | undefined {
  return locaties.find((locatie) => locatie.locatietype === 'Correspondentie');
}

export function getContactgegevensFromVereniging(
  vereniging: Vereniging,
): Contactgegeven[] {
  return (
    vereniging.contactgegevens?.map((contactgegeven) => {
      // We only return the data we actually need. The API responds with more (nested) data.
      return {
        contactgegevenId: contactgegeven.contactgegevenId,
        contactgegeventype: contactgegeven.contactgegeventype,
        waarde: contactgegeven.waarde,
        isPrimair: contactgegeven.isPrimair,
      };
    }) || []
  );
}

export async function getVertegenwoordigers(
  association: Association,
  reason: Concept,
): Promise<Vertegenwoordiger[]> {
  assert('concept id is required', reason.id);
  const vereniging = (await getVerenigingDetails(association, reason.id))
    .vereniging;

  return (
    vereniging.vertegenwoordigers?.map((vertegenwoordiger) => {
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
    }) || []
  );
}

////////////////////////////////////////////////////////////////////////////
// Data persistence
////////////////////////////////////////////////////////////////////////////

export async function createOrUpdateContactgegeven({
  vCode,
  contactgegevenId,
  data,
}: {
  vCode: string;
  contactgegevenId?: number;
  data: Partial<Contactgegeven>;
}) {
  const url = buildContactgegevenUrl(vCode, contactgegevenId);
  const method = contactgegevenId ? 'PATCH' : 'POST';

  await manager.request({
    url,
    method,
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({
      contactgegeven: data,
    }),
  });
}

export async function deleteContactgegeven(
  vCode: string,
  contactgegevenId: number,
) {
  const url = buildContactgegevenUrl(vCode, contactgegevenId);

  await manager.request({
    url,
    method: 'DELETE',
  });
}

export async function createOrUpdateCorrespondenceLocatie({
  vCode,
  locatieId,
  data,
}: {
  vCode: string;
  locatieId?: number;
  data: Partial<Adres & AdresIdentifier>;
}) {
  const url = buildLocatieUrl(vCode, locatieId);
  const isNew = typeof locatieId !== 'number';
  const method = isNew ? 'POST' : 'PATCH';
  const locatieData: Partial<Locatie> = {};

  if (isNew) {
    locatieData.locatietype = 'Correspondentie';
  }

  // "adresId" and "adres" are mutually exclusive.
  // The verenigingsregister API will automatically fetch the address information when we provide the address register URI.
  if (data.bronwaarde) {
    locatieData.adresId = {
      broncode: 'AR',
      bronwaarde: data.bronwaarde,
    };
  } else {
    assert(
      'all required address fields are expected to be set',
      data.straatnaam &&
        data.huisnummer &&
        data.postcode &&
        data.gemeente &&
        data.land,
    );

    // It seems we need to send _all_ the address values, even if only a single part changes,
    locatieData['adres'] = {
      straatnaam: data.straatnaam,
      huisnummer: data.huisnummer,
      busnummer: data.busnummer,
      postcode: data.postcode,
      gemeente: data.gemeente,
      land: data.land,
    };
  }

  await manager.request({
    url,
    method,
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({ locatie: locatieData }),
  });
}

export async function deleteCorrespondenceLocatie(
  vCode: string,
  locatieId: number,
) {
  const url = buildLocatieUrl(vCode, locatieId);

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

////////////////////////////////////////////////////////////////////////////
// Url builders
////////////////////////////////////////////////////////////////////////////

function buildVerenigingUrl(vCode: string) {
  return `/verenigingen-proxy/${vCode}`;
}

function buildBasisInformatieUrl(vCode: string) {
  return buildVerenigingUrl(vCode) + '/basisinformatie';
}

function buildContactgegevenUrl(vCode: string, contactgegevenId?: number) {
  const url = buildVerenigingUrl(vCode) + '/contactgegevens';

  if (typeof contactgegevenId === 'number') {
    return url + '/' + contactgegevenId;
  }

  return url;
}

function buildLocatieUrl(vCode: string, locatieId?: number) {
  const url = buildVerenigingUrl(vCode) + '/locaties';

  if (locatieId) {
    return url + '/' + locatieId;
  }

  return url;
}

async function buildVertegenwoordigerUrl(
  vertegenwoordiger: Vertegenwoordiger,
  association: Association,
  isNew: boolean = false,
) {
  const vCode = await associationVCode(association);
  const url = buildVerenigingUrl(vCode) + '/vertegenwoordigers';

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

////////////////////////////////////////////////////////////////////////////
// Error handling
////////////////////////////////////////////////////////////////////////////

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

export class ApiValidationError<T> extends Error {
  subject: T;
  name: string;

  constructor(subject: T) {
    super('API Validation error');
    this.name = 'ApiValidationError';
    this.subject = subject;
  }
}

////////////////////////////////////////////////////////////////////////////
// Validations
////////////////////////////////////////////////////////////////////////////

// TODO: move the validation code to the representatives edit page, it doesn't really belong here
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
