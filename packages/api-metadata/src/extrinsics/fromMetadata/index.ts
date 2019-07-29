// Copyright 2017-2019 @polkadot/api-metadata authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Calls, ModulesWithCalls } from '@polkadot/types/types';

import { ModuleMetadata } from '@polkadot/types/Metadata/v7/Metadata';
import Metadata from '@polkadot/types/Metadata';
import { stringCamelCase } from '@polkadot/util';

import extrinsics from '../';
import createUnchecked from './createUnchecked';

/**
 * Return an object with the modules and the functions to use extrinsics.
 *
 * @param metadata - The metadata
 */
export default function fromMetadata (metadata: Metadata): ModulesWithCalls {
  return metadata.asV7.modules
    .filter((modul): boolean => modul.calls.isSome)
    .reduce((result, modul: ModuleMetadata, sectionIndex): ModulesWithCalls => {
      const section = stringCamelCase(modul.name.toString());

      result[section] = modul.calls.unwrap().reduce((newModule, callMetadata, methodIndex): Calls => {
        const method = stringCamelCase(callMetadata.name.toString());

        newModule[method] = createUnchecked(section, sectionIndex, methodIndex, callMetadata);

        return newModule;
      }, {} as unknown as Calls);

      return result;
    }, { ...extrinsics });
}
