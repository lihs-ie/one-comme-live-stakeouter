import { ImmutableDate } from 'domains/common/date';
import {
  Channel,
  ChannelIdentifier,
  MonitoringSetting,
  MonitoringStarted,
  Rule,
} from 'domains/monitoring';

import { Builder, StringFactory } from 'tests/factories';
import { ImmutableDateFactory, TimeStampFactory } from 'tests/factories/domains/common/date';
import { PlatformTypeFactory } from 'tests/factories/domains/common/platform';
import {
  ChannelFactory,
  ChannelIdentifierFactory,
  MonitoringSettingFactory,
} from 'tests/factories/domains/monitoring';
import { uuidV4FromSeed } from 'tests/helpers';

import { ValueObjectTest } from '../common/value-object';

describe('Package channel', () => {
  describe('MonitoringSetting', () => {
    ValueObjectTest(
      MonitoringSetting,
      {
        checkInterval: Math.floor(Math.random() * 3591) + 10,
        isMonitoring: true,
      },
      [
        { checkInterval: 10 },
        { checkInterval: 3600 },
        { checkInterval: null },
        { isMonitoring: false },
      ],
      [
        { checkInterval: 9 },
        { checkInterval: 3601 },
        { checkInterval: 'invalid' },
        { isMonitoring: 'invalid' },
      ]
    );
  });

  describe('ChannelIdentifier', () => {
    ValueObjectTest(
      ChannelIdentifier,
      {
        value: Builder(StringFactory(1, 64)).buildWith(0),
        platform: Builder(PlatformTypeFactory).buildWith(0),
      },
      [
        {
          value: Builder(StringFactory(1, 1)).buildWith(1),
        },
        { value: Builder(StringFactory(64, 64)).buildWith(1) },
      ],
      [{ value: '' }, { value: Builder(StringFactory(65, 65)).build() }]
    );
  });

  describe('Channel', () => {
    describe('instantiate', () => {
      describe('successfully', () => {
        it.each([null, Builder(ImmutableDateFactory).build()])(
          'should return Channel with lastCheckedAt: %s',
          lastCheckedAt => {
            const identifier = Builder(ChannelIdentifierFactory).build();
            const setting = Builder(MonitoringSettingFactory).build();
            const timestamp = Builder(TimeStampFactory).build();

            const channel = Channel({
              identifier,
              setting,
              lastCheckedAt,
              timestamp,
            });

            expect(identifier).toEqualValueObject(channel.identifier);
            expect(setting).toEqualValueObject(channel.setting);
            expect(lastCheckedAt).toBeNullOr(
              channel.lastCheckedAt,
              (expectedLastCheckedAt, actualLastCheckedAt) => {
                expect(expectedLastCheckedAt).toEqualValueObject(actualLastCheckedAt);
              }
            );
            expect(timestamp).toEqualValueObject(channel.timestamp);
          }
        );
      });
    });

    describe('toggleMonitoring', () => {
      it('should return Channel with toggled isMonitoring', () => {
        const channel = Builder(ChannelFactory).build({
          timestamp: Builder(TimeStampFactory).build({
            createdAt: ImmutableDate.now(),
            updatedAt: ImmutableDate.now(),
          }),
        });

        const actual1 = channel.toggleMonitoring();

        expect(actual1.setting.isMonitoring).toBe(!channel.setting.isMonitoring);

        const actual2 = actual1.toggleMonitoring();

        expect(actual2.setting.isMonitoring).toBe(channel.setting.isMonitoring);
      });
    });
  });

  describe('Rule', () => {
    describe('instantiate', () => {
      describe('successfully', () => {
        it('should return Rule %s', overrides => {
          const platform = Builder(PlatformTypeFactory).build();
          const maxConcurrentChecks = Math.floor(Math.random() * 10) + 1;
          const rateLimitWindow = Math.floor(Math.random() * 59) + 1;
          const maxRequestsPerWindow = Math.floor(Math.random() * 20) + 1;
          const backoffMultiplier = Math.floor(Math.random() * 5) + 1;

          const rule = Rule({
            platform,
            maxConcurrentChecks,
            rateLimitWindow,
            maxRequestsPerWindow,
            backoffMultiplier,
            ...overrides,
          });

          expect(rule.platform).toBe(platform);
          expect(rule.maxConcurrentChecks).toBe(maxConcurrentChecks);
          expect(rule.rateLimitWindow).toBe(rateLimitWindow);
          expect(rule.maxRequestsPerWindow).toBe(maxRequestsPerWindow);
          expect(rule.backoffMultiplier).toBe(backoffMultiplier);
        });
      });

      describe('unsuccessfully', () => {
        it.each<Partial<Rule>>([
          { rateLimitWindow: 0 },
          { maxRequestsPerWindow: 0 },
          { backoffMultiplier: 0 },
        ])('should throw error with invalid %o', overrides => {
          const platform = Builder(PlatformTypeFactory).build();
          const maxConcurrentChecks = Math.floor(Math.random() * 10) + 1;
          const rateLimitWindow = Math.floor(Math.random() * 59) + 1;
          const maxRequestsPerWindow = Math.floor(Math.random() * 20) + 1;
          const backoffMultiplier = Math.floor(Math.random() * 5) + 1;

          expect(() => {
            Rule({
              platform,
              maxConcurrentChecks,
              rateLimitWindow,
              maxRequestsPerWindow,
              backoffMultiplier,
              ...overrides,
            });
          }).toThrowError();
        });
      });
    });
  });

  describe('MonitoringStarted', () => {
    describe('instantiate', () => {
      describe('successfully', () => {
        it('should return event', () => {
          const channel = Builder(ChannelIdentifierFactory).build();
          const identifier = uuidV4FromSeed(Math.random());
          const occurredAt = Builder(ImmutableDateFactory).build();

          const event = MonitoringStarted({ channel, identifier, occurredAt });

          expect(identifier).toBe(event.identifier);
          expect(occurredAt).toEqualValueObject(event.occurredAt);
          expect(channel).toEqualValueObject(event.channel);
          expect(event.type).toBe('MonitoringStarted');
        });
      });
    });
  });
});
