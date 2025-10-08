import { z } from 'zod';

export const PlatformType = {
  YOUTUBE: 'youtube',
  NICONICO: 'niconico',
} as const;

export type PlatformType = (typeof PlatformType)[keyof typeof PlatformType];

export const platformTypeSchema = z.enum(PlatformType);
