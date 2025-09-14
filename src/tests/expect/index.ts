import { ValueObject } from 'domains/common/value-object';

export {};

expect.extend({
  toBeNullOr<T>(actual: T | null, expected: T | null, comparer?: (expected: T, actual: T) => void) {
    try {
      if (expected === null) {
        expect(actual).toBeNull();
      } else {
        if (comparer) {
          comparer(expected, actual!);
        } else {
          expect(actual).toBe(expected);
        }
      }

      return {
        message: () => 'OK',
        pass: true,
      };
    } catch (error) {
      return {
        message: () => (error as Error).message,
        pass: false,
      };
    }
  },
  toEqualValueObject<V extends Record<string, unknown>, T extends ValueObject<V>>(
    actual: T,
    expected: T
  ) {
    try {
      expect(
        expected.equals(actual),
        `Expected value object to be equal, but it is not. Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`
      ).toBeTruthy();

      return {
        message: () => 'OK',
        pass: true,
      };
    } catch (error) {
      return {
        message: () => (error as Error).message,
        pass: false,
      };
    }
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeNullOr<T>(expected: T | null, comparer?: (expected: T, actual: T) => void): R;
      toEqualValueObject<V extends Record<string, unknown>, T extends ValueObject<V>>(
        expected: T
      ): R;
    }
  }
}
