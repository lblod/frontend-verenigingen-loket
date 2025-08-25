import type ContactPoint from 'frontend-verenigingen-loket/models/contact-point';
import { associationVCode } from 'frontend-verenigingen-loket/models/association';
import type Association from 'frontend-verenigingen-loket/models/association';
import type { ChangedAttributesHash } from '@warp-drive/core-types/cache';
import { assert } from '@ember/debug';
import RequestManager from '@ember-data/request';
import Fetch from '@ember-data/request/fetch';

const manager = new RequestManager().use([Fetch]);

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

async function buildContactDetailUrl(contactPoint: ContactPoint) {
  const association = contactPoint.organization;
  const internalId = contactPoint.internalId;

  const url = (await buildVerenigingUrl(association)) + '/contactgegevens';

  if (!contactPoint.isNew) {
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

async function buildVerenigingUrl(association: Association) {
  const vCode = await associationVCode(association);
  return `/verenigingen/${vCode}`;
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
): Record<string, unknown> {
  const mappedAttributes: Record<string, unknown> = {};

  Object.keys(attributes).forEach((attribute) => {
    // TODO: there might be a way to type this properly without the type assertion?
    const mappedAttributeOrHandler = attributeMap[attribute as keyof T];
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
