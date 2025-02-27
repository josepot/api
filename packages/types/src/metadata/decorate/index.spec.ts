// Copyright 2017-2021 @polkadot/types authors & contributors
// SPDX-License-Identifier: Apache-2.0

import json from '@polkadot/types-support/metadata/static-substrate';
import { u8aToHex } from '@polkadot/util';

import { TypeRegistry } from '../../create';
import { u32 } from '../../primitive';
import { Metadata } from '../Metadata';
import { decorateConstants, decorateExtrinsics, decorateStorage } from './';

const registry = new TypeRegistry();
const metadata = new Metadata(registry, json);

registry.setMetadata(metadata);

describe('Decorated', () => {
  it('should correctly get Alice\'s nonce storage key (u8a)', (): void => {
    const query = decorateStorage(registry, metadata.asLatest, metadata.version);

    expect(
      u8aToHex(
        query.system.account('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY')
      )
    ).toEqual(
      '0x410126aa394eea5630e07c48ae0c9558cef7b99d880ec681799c0cf30e8886371da9de1e86a9a8c739864cf3cc5ec2bea59fd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d'
    );
  });

  it('should return properly-encoded transactions', (): void => {
    const tx = decorateExtrinsics(registry, metadata.asLatest, metadata.version);

    expect(
      registry.createType('Extrinsic', tx.timestamp.set([10101])).toU8a()
    ).toEqual(
      new Uint8Array([
        // length (encoded)
        4 << 2,
        // version, no signature
        4,
        // index
        3, 0,
        // values, Compact<Moment>
        116
      ])
    );
  });

  it('should return constants with the correct type and value', (): void => {
    const consts = decorateConstants(registry, metadata.asLatest, metadata.version);

    expect(consts.democracy.cooloffPeriod).toBeInstanceOf(u32); // BlockNumber
    expect(consts.democracy.cooloffPeriod.toHex()).toEqual('0x000c4e00');
  });
});
