// Copyright 2017-2021 @polkadot/types authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable sort-keys */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import type { BlockValue } from './Block';

import block00300 from '@polkadot/types-support/json/SignedBlock.003.00.json';
import metadataStatic from '@polkadot/types-support/metadata/static-substrate';

import { TypeRegistry } from '../create';
import { Metadata } from '../metadata';
import { GenericBlock as Block } from './Block';

interface BlockJson {
  result: {
    block: BlockValue;
  };
}

const registry = new TypeRegistry();
const metadata = new Metadata(registry, metadataStatic);

registry.setMetadata(metadata);

describe('Block', (): void => {
  it('has a valid toRawType', (): void => {
    expect(
      new Block(registry).toRawType()
    ).toEqual(
      // each of the containing structures have been stringified on their own
      JSON.stringify({
        header: 'Header',
        extrinsics: 'Vec<Extrinsic>'
      })
    );
  });

  it('re-encodes digest items correctly', (): void => {
    const digest = new Block(registry, (block00300 as BlockJson).result.block).header.digest;

    expect(digest.logs[0].toHex()).toEqual((block00300 as BlockJson).result.block.header?.digest?.logs[0]);
    expect(digest.logs[1].toHex()).toEqual((block00300 as BlockJson).result.block.header?.digest?.logs[1]);
  });
});
