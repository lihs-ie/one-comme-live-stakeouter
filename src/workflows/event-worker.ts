import { Logger } from 'aspects/log';

import { type EventBroker } from 'domains/common/event';

/**
 * イベントワーカーを停止する関数型
 */
export type StopWorker = () => void;

/**
 * イベントキュー処理ワーカーを起動する
 *
 * @description
 * EventBrokerのキューを定期的にポーリングし、溜まっているイベントを処理する。
 * Laravel SupervisorのようなワーカープロセスをNode.js環境で実現する。
 * setIntervalを使用して指定間隔でconsume()を呼び出す。
 *
 * @param broker - イベントブローカー
 * @param logger - ロガー
 * @param intervalMs - ポーリング間隔（ミリ秒）デフォルトは100ms
 * @returns ワーカーを停止する関数
 *
 * @example
 * ```typescript
 * const broker = EventBroker(queueDriver);
 * const stopWorker = startEventWorker(broker, logger, 100);
 *
 * // ワーカーを停止
 * stopWorker();
 * ```
 */
export const startEventWorker = (
  broker: EventBroker,
  logger: Logger,
  intervalMs: number = 100
): StopWorker => {
  logger.info(`[EventWorker] Starting event worker with interval: ${intervalMs}ms`);

  const workerId = setInterval(() => {
    broker.consume().mapErr(error => {
      logger.error('[EventWorker] Failed to consume events', error);
    });
  }, intervalMs);

  return (): void => {
    clearInterval(workerId);
    logger.info('[EventWorker] Event worker stopped');
  };
};
