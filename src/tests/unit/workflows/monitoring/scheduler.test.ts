import { describe, it } from 'vitest';

import { Logger } from 'aspects/log';
import { StartMonitoringScheduler } from 'workflows/monitoring/scheduler';

import { MonitoringTick } from 'domains/monitoring';

import { Builder } from 'tests/factories';
import { EventBrokerFactory, QueueingDriverFactory } from 'tests/factories/domains/common/event';
import { MockTimer } from 'tests/mock/node-js';

describe('Package workflows/monitoring/scheduler', () => {
  describe('StartMonitoringScheduler ', () => {
    beforeEach(() => {
      vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('publishes MonitoringTick event at each tick interval.', async () => {
      const queue = Builder(QueueingDriverFactory).build();
      const broker = Builder(EventBrokerFactory).build({ queue });

      const [timer, advanceBy] = MockTimer();

      const workflow = StartMonitoringScheduler(broker)(timer)(Logger);

      const tickMilliseconds = Math.floor(Math.random() * 1000) + 500;

      const result = await workflow({ tickMilliseconds });

      const stop = result._unsafeUnwrap();

      expect(stop).toBeInstanceOf(Function);

      // Not yet ticked
      advanceBy(tickMilliseconds - 1);
      expect(queue.isEmpty()).toBeTruthy();

      // First tick
      advanceBy(1);
      expect(queue.isEmpty()).toBeFalsy();

      const dequeued = queue.dequeue<MonitoringTick>()._unsafeUnwrap();

      expect(dequeued.type).toBe('MonitoringTick');
      expect(dequeued.occurredAt.toISOString()).toBe('2024-01-01T00:00:00.000Z');
      expect(dequeued.identifier).toBeDefined();
    });
  });
});
