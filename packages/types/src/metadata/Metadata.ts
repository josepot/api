// Copyright 2017-2021 @polkadot/types authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Registry } from '../types';

import { isHex, isU8a, u8aToU8a } from '@polkadot/util';

import { MetadataVersioned } from './MetadataVersioned';

// magic u32 preceding the version id
const VERSION_IDX = 4;

// magic + lowest supported version
const EMPTY_METADATA = new Uint8Array([0x6d, 0x65, 0x74, 0x61, 9]);
const EMPTY_U8A = new Uint8Array();

function toU8a (value: Uint8Array | string = EMPTY_U8A): Uint8Array {
  if (isHex(value)) {
    return toU8a(u8aToU8a(value));
  } else if (isU8a(value)) {
    return value.length === 0
      ? EMPTY_METADATA
      : value;
  }

  throw new Error('Invalid type passed to Metadata constructor');
}

function decodeMetadata (registry: Registry, _value?: Uint8Array | string | Map<string, unknown> | Record<string, unknown>): MetadataVersioned {
  if (isU8a(_value) || !_value || isHex(_value)) {
    const value = toU8a(_value);
    const version = value[VERSION_IDX];

    try {
      return new MetadataVersioned(registry, value);
    } catch (error) {
      // This is an f-ing hack as a follow-up to another ugly hack
      // https://github.com/polkadot-js/api/commit/a9211690be6b68ad6c6dad7852f1665cadcfa5b2
      // when we fail on V9, try to re-parse it as v10... yes... HACK
      if (version === 9) {
        value[VERSION_IDX] = 10;

        return decodeMetadata(registry, value);
      }

      throw error;
    }
  }

  return new MetadataVersioned(registry, _value);
}

/**
 * @name Metadata
 * @description
 * The versioned runtime metadata as a decoded structure
 */
export class Metadata extends MetadataVersioned {
  constructor (registry: Registry, value?: Uint8Array | string | Map<string, unknown> | Record<string, unknown>) {
    super(registry, decodeMetadata(registry, value));
  }
}
