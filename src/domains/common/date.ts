import { z } from 'zod';

import { createFunctionSchema } from 'aspects/type';

import { ValueObject, valueObjectSchema } from './value-object';
export const immutableDateSchema = valueObjectSchema
  .extend({
    toISOString: createFunctionSchema(z.function({ input: [], output: z.string() })),
    toUTCString: createFunctionSchema(z.function({ input: [], output: z.string() })),
    toDateString: createFunctionSchema(z.function({ input: [], output: z.string() })),
    toTimeString: createFunctionSchema(z.function({ input: [], output: z.string() })),
    timestamp: z.number().int().min(-8_640_000_000_000_000).max(8_640_000_000_000_000),
  })
  .brand('ImmutableDate');

export type ImmutableDate = ValueObject<z.infer<typeof immutableDateSchema>>;

const ImmutableDateImplementation = (milliseconds: number): ImmutableDate => {
  // Fixed epoch milliseconds
  const epochMillisecondsValue = milliseconds;

  const MILLI_SECONDS_PER_DAY = 86_400_000;
  const MILLI_SECONDS_PER_HOUR = 3_600_000;
  const MILLI_SECONDS_PER_MINUTE = 60_000;
  const MILLI_SECONDS_PER_SECOND = 1_000;

  const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

  const dayFromYear = (y: number) =>
    365 * (y - 1970) +
    Math.floor((y - 1969) / 4) -
    Math.floor((y - 1901) / 100) +
    Math.floor((y - 1601) / 400);

  const yearFromDays = (days: number): number => {
    let lo = -400_000;
    let hi = 400_000;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const a = dayFromYear(mid);
      const b = dayFromYear(mid + 1);
      if (days < a) {
        hi = mid - 1;
      } else if (days >= b) {
        lo = mid + 1;
      } else {
        return mid;
      }
    }
    return 1970;
  };

  const monthLength = (y: number, m0: number) => {
    if (m0 === 1) return isLeapYear(y) ? 29 : 28; // Feb
    return [31, -1, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m0]!;
  };

  const pad2 = (value: number) => (value < 10 ? `0${value}` : `${value}`);
  const pad3 = (value: number) => value.toString().padStart(3, '0');

  const formatYearExtended = (year: number): string => {
    if (0 <= year && year <= 9999) {
      return year.toString().padStart(4, '0');
    }
    const sign = year < 0 ? '-' : '+';
    const absoluteYearString = Math.abs(year).toString().padStart(6, '0');
    return sign + absoluteYearString;
  };

  // メソッド差し替えにより未使用だが、元構造を保持するため参照を残す
  void pad3;
  void formatYearExtended;

  const weekdayShortNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
  const monthShortNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ] as const;

  const splitEpochToDatePartsUTC = (epochMilliseconds: number) => {
    const daysSinceEpoch = Math.floor(epochMilliseconds / MILLI_SECONDS_PER_DAY);
    const msWithinDayRaw = epochMilliseconds % MILLI_SECONDS_PER_DAY;
    const msWithinDay =
      msWithinDayRaw >= 0 ? msWithinDayRaw : msWithinDayRaw + MILLI_SECONDS_PER_DAY;

    const year = yearFromDays(daysSinceEpoch);
    const dayOfYear = daysSinceEpoch - dayFromYear(year);

    let m0 = 0; // 0=Jan
    let d = dayOfYear;
    for (; m0 < 12; m0++) {
      const ml = monthLength(year, m0);
      if (d < ml) break;
      d -= ml;
    }
    const month = m0 + 1;
    const day = d + 1;

    const hours = Math.trunc(msWithinDay / MILLI_SECONDS_PER_HOUR);
    const remAfterHour = msWithinDay - hours * MILLI_SECONDS_PER_HOUR;

    const minutes = Math.trunc(remAfterHour / MILLI_SECONDS_PER_MINUTE);
    const remAfterMinute = remAfterHour - minutes * MILLI_SECONDS_PER_MINUTE;

    const seconds = Math.trunc(remAfterMinute / MILLI_SECONDS_PER_SECOND);
    const milliseconds = remAfterMinute - seconds * MILLI_SECONDS_PER_SECOND;

    const weekdayIndex = (((daysSinceEpoch + 4) % 7) + 7) % 7;

    return { year, month, day, hours, minutes, seconds, milliseconds, weekdayIndex };
  };

  const toISOString = () => new Date(epochMillisecondsValue).toISOString();

  // RFC7231 の IMF-fixdate に準拠（例: "Thu, 01 Jan 1970 00:00:00 GMT"）
  const toUTCString = () => {
    const { year, month, day, hours, minutes, seconds, weekdayIndex } =
      splitEpochToDatePartsUTC(epochMillisecondsValue);

    const weekdayName = weekdayShortNames[weekdayIndex];
    const monthName = monthShortNames[month - 1];
    return `${weekdayName}, ${pad2(day)} ${monthName} ${year.toString().padStart(4, '0')} ${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)} GMT`;
  };

  // JSの toDateString に近い形式（UTC基準で安定出力）
  // 例: "Thu Jan 01 1970"
  const toDateString = () => {
    const { year, month, day, weekdayIndex } = splitEpochToDatePartsUTC(epochMillisecondsValue);
    const weekdayName = weekdayShortNames[weekdayIndex];
    const monthName = monthShortNames[month - 1];
    return `${weekdayName} ${monthName} ${pad2(day)} ${year.toString().padStart(4, '0')}`;
  };

  // JSの toTimeString に似た安定出力（UTC固定）
  // 例: "00:00:00 GMT"
  const toTimeString = () => {
    const { hours, minutes, seconds } = splitEpochToDatePartsUTC(epochMillisecondsValue);
    return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)} GMT`;
  };

  const properties = {
    toISOString,
    toUTCString,
    toDateString,
    toTimeString,
    timestamp: epochMillisecondsValue,
  };

  return ValueObject<ImmutableDate>(immutableDateSchema)(properties);
};

type ImmutableDateConstructor = {
  create: typeof immutableDateConstructor;
  now: () => ImmutableDate;
};

function immutableDateConstructor(): ImmutableDate;
function immutableDateConstructor(value: string): ImmutableDate;
function immutableDateConstructor(value: number): ImmutableDate;
function immutableDateConstructor(value: Date): ImmutableDate;
function immutableDateConstructor(value?: string | number | Date): ImmutableDate {
  if (value === undefined) {
    return ImmutableDateImplementation(Date.now());
  }

  if (typeof value === 'string') {
    return ImmutableDateImplementation(Date.parse(value));
  }

  if (typeof value === 'number') {
    return ImmutableDateImplementation(value);
  }

  if (value instanceof Date) {
    return ImmutableDateImplementation(value.getTime());
  }

  throw new TypeError('Invalid argument for ImmutableDate.');
}

export const ImmutableDate: ImmutableDateConstructor = Object.assign(ImmutableDateImplementation, {
  now: () => ImmutableDateImplementation(Date.now()),
  create: immutableDateConstructor,
});

export const timestampSchema = valueObjectSchema
  .extend({
    createdAt: immutableDateSchema,
    updatedAt: immutableDateSchema,
  })
  .refine(data => data.updatedAt.timestamp >= data.createdAt.timestamp, {
    error: 'updatedAt must be after or equal to createdAt',
    path: ['updatedAt'],
  })
  .brand('Timestamp');

export type Timestamp = ValueObject<z.infer<typeof timestampSchema>>;

export const Timestamp = ValueObject<Timestamp>(timestampSchema);
