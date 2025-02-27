// Copyright 2017-2021 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Observable } from 'rxjs';
import type { ApiInterfaceRx } from '@polkadot/api/types';
import type { AnyFunction } from '@polkadot/types/types';

import { lazyDeriveSection } from './util/lazy';
import * as accounts from './accounts';
import * as balances from './balances';
import * as bounties from './bounties';
import * as chain from './chain';
import * as contracts from './contracts';
import * as council from './council';
import * as crowdloan from './crowdloan';
import * as democracy from './democracy';
import * as elections from './elections';
import * as imOnline from './imOnline';
import * as membership from './membership';
import * as parachains from './parachains';
import * as session from './session';
import * as society from './society';
import * as staking from './staking';
import * as technicalCommittee from './technicalCommittee';
import * as treasury from './treasury';
import * as tx from './tx';

export { packageInfo } from './packageInfo';
export * from './type';

interface Avail {
  instances: string[];
  withDetect?: boolean;
}

export { lazyDeriveSection };

export const derive = { accounts, balances, bounties, chain, contracts, council, crowdloan, democracy, elections, imOnline, membership, parachains, session, society, staking, technicalCommittee, treasury, tx };

type DeriveSection<Section> = {
  [Method in keyof Section]: Section[Method] extends AnyFunction
    ? ReturnType<Section[Method]> // ReturnType<Section[Method]> will be the inner function, i.e. without (api) argument
    : never;
};
type DeriveAllSections<AllSections> = {
  [Section in keyof AllSections]: DeriveSection<AllSections[Section]>
};

type DeriveCreator = (instanceId: string, api: ApiInterfaceRx) => (...args: unknown[]) => Observable<any>;

export type DeriveCustom = Record<string, Record<string, DeriveCreator>>;

export type ExactDerive = DeriveAllSections<typeof derive>;

// Enable derive only if some of these modules are available
const checks: Record<string, Avail> = {
  contracts: { instances: ['contracts'] },
  council: { instances: ['council'], withDetect: true },
  crowdloan: { instances: ['crowdloan'] },
  democracy: { instances: ['democracy'] },
  elections: { instances: ['phragmenElection', 'electionsPhragmen', 'elections', 'council'], withDetect: true },
  imOnline: { instances: ['imOnline'] },
  membership: { instances: ['membership'] },
  parachains: { instances: ['parachains', 'registrar'] },
  session: { instances: ['session'] },
  society: { instances: ['society'] },
  staking: { instances: ['staking'] },
  technicalCommittee: { instances: ['technicalCommittee'], withDetect: true },
  treasury: { instances: ['treasury'] }
};

function getModuleInstances (api: ApiInterfaceRx, specName: string, moduleName: string): string[] {
  return api.registry.getModuleInstances(specName, moduleName) || [];
}

/**
 * Returns an object that will inject `api` into all the functions inside
 * `allSections`, and keep the object architecture of `allSections`.
 */
/** @internal */
function injectFunctions (instanceId: string, api: ApiInterfaceRx, derives: DeriveCustom): ExactDerive {
  const queryKeys = Object.keys(api.query);
  const specName = api.runtimeVersion.specName.toString();

  const filterQueryKeys = (q: string) =>
    queryKeys.includes(q);

  const filterInstances = (q: string) =>
    getModuleInstances(api, specName, q).some(filterQueryKeys);

  const isIncluded = (s: string) => (
    !checks[s] ||
    checks[s].instances.some(filterQueryKeys) ||
    (
      checks[s].withDetect &&
      checks[s].instances.some(filterInstances)
    )
  );

  const getKeys = (section: string) =>
    Object.keys(derives[section]);

  const creator = (section: string, method: string) =>
    derives[section][method](instanceId, api);

  const result: Record<string, Record<string, AnyFunction>> = {};
  const names = Object.keys(derives);

  for (let i = 0; i < names.length; i++) {
    const name = names[i];

    if (isIncluded(name)) {
      lazyDeriveSection(result, name, getKeys, creator);
    }
  }

  return result as ExactDerive;
}

// FIXME The return type of this function should be {...ExactDerive, ...DeriveCustom}
// For now we just drop the custom derive typings
/** @internal */
export function getAvailableDerives (instanceId: string, api: ApiInterfaceRx, custom: DeriveCustom = {}): ExactDerive {
  return {
    ...injectFunctions(instanceId, api, derive as DeriveCustom),
    ...injectFunctions(instanceId, api, custom)
  };
}
