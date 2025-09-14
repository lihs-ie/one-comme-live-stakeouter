import { ImmutableDate, Timestamp } from 'domains/common/date';

import { ValueObjectTest } from './value-object';

describe('Package date', () => {
  describe('ImmutableDate', () => {
    ValueObjectTest(
      property => ImmutableDate.create(property.value),
      { value: 0 },
      [{ value: -8640000000000000 }, { value: 8640000000000000 }, { value: 1234567890123 }],
      [
        { value: -8640000000000000 - 1 },
        { value: 8640000000000000 + 1 },
        { value: NaN },
        { value: Infinity },
        { value: -Infinity },
      ]
    );
  });

  describe('Timestamp', () => {
    ValueObjectTest(
      Timestamp,
      { createdAt: ImmutableDate.create(0), updatedAt: ImmutableDate.create(0) },
      [
        { createdAt: ImmutableDate.create(0), updatedAt: ImmutableDate.create(1234567890123) },
        {
          createdAt: ImmutableDate.create(-8640000000000000),
          updatedAt: ImmutableDate.create(-8640000000000000),
        },
        {
          createdAt: ImmutableDate.create(8640000000000000),
          updatedAt: ImmutableDate.create(8640000000000000),
        },
      ],
      [{ createdAt: ImmutableDate.create(1), updatedAt: ImmutableDate.create(0) }]
    );
  });
});
