import { splitmix64, fnv1a64, mapU64ToRange } from 'aspects/bit';

import { ImmutableDate, Timestamp } from 'domains/common/date';

import { Builder, Factory } from '../../builder';

type TimestampProperties = {
  createdAt: ImmutableDate;
  updatedAt: ImmutableDate;
};

export const TimeStampFactory = Factory<Timestamp, TimestampProperties>({
  instantiate: (properties: TimestampProperties) => Timestamp(properties),
  prepare: (overrides: Partial<TimestampProperties>, seed: number) => ({
    createdAt: overrides.createdAt ?? Builder(ImmutableDateFactory).buildWith(seed),
    updatedAt: overrides.updatedAt ?? Builder(ImmutableDateFactory).buildWith(seed),
  }),
  retrieve: (instance: Timestamp) => ({
    createdAt: instance.createdAt,
    updatedAt: instance.updatedAt,
  }),
});

type DateProperties = {
  value: number;
};

export const ImmutableDateFactory = Factory<ImmutableDate, DateProperties>({
  instantiate: (properties: DateProperties) => ImmutableDate.create(properties.value),
  prepare: (overrides: Partial<DateProperties>, seed: number) => {
    const u64 = splitmix64(fnv1a64(seed));
    const msBig = mapU64ToRange(u64, -8_640_000_000_000_000n, 8_640_000_000_000_000n);

    return {
      value: overrides.value ?? Number(msBig),
    };
  },
  retrieve: (instance: ImmutableDate) => ({
    value: instance.timestamp,
  }),
});
