import { TransactionManager, TransactionStrategy } from 'domains/common/transaction';

import { Builder, Factory } from 'tests/factories/builder';

export const TransactionStrategyFactory = Factory<TransactionStrategy, TransactionStrategy>({
  instantiate: properties => properties,
  prepare: (overrides, _) => ({
    doBegin: () => console.log('Begin Transaction'),
    doCommit: () => console.log('Commit Transaction'),
    doRollback: () => console.log('Rollback Transaction'),
    ...overrides,
  }),
  retrieve: _ => {
    throw new Error('TransactionStrategy cannot be retrieve.');
  },
});

export type TransactionManagerProperties = {
  strategy: TransactionStrategy;
};

export const TransactionManagerFactory = Factory<TransactionManager, TransactionManagerProperties>({
  instantiate: properties => TransactionManager(properties.strategy),
  prepare: (overrides, seed) => ({
    strategy: overrides.strategy ?? Builder(TransactionStrategyFactory).buildWith(seed),
  }),
  retrieve: _ => {
    throw new Error('TransactionManager cannot be retrieved.');
  },
});
