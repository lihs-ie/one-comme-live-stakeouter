import { ResultAsync } from 'neverthrow';

import { CommonError, other } from 'aspects/error';

export interface TransactionStrategy {
  doBegin: () => void;
  doCommit: () => void;
  doRollback: () => void;
}

export interface TransactionManager {
  begin: () => void;
  commit: () => void;
  rollback: () => void;
  execute: <R>(callback: () => R) => ResultAsync<R, CommonError>;
}

export const TransactionManager = (strategy: TransactionStrategy): TransactionManager => {
  let level = 0;

  const begin = () => {
    if (level++ === 0) {
      strategy.doBegin();
    }
  };

  const commit = () => {
    if (--level === 0) {
      strategy.doCommit();
    }
  };

  const rollback = () => {
    if (level === 0) {
      return;
    }

    level = 0;
    strategy.doRollback();
  };

  const execute = <R>(callback: () => R): ResultAsync<R, CommonError> =>
    ResultAsync.fromThrowable<[], R, CommonError>(
      () => {
        begin();

        const result = callback();

        commit();

        return Promise.resolve(result);
      },
      error => {
        rollback();
        return other((error as Error).message);
      }
    )();

  return {
    begin,
    commit,
    rollback,
    execute,
  };
};
