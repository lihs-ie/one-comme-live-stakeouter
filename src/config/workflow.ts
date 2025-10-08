import z from 'zod';

import { PlatformType, platformTypeSchema } from 'domains/common/platform';

const viewerServiceConfigurationSchema = z.object({
  defaultURL: z.url(),
  color: z.object({
    red: z.number().min(0).max(255),
    green: z.number().min(0).max(255),
    blue: z.number().min(0).max(255),
  }),
});

const workflowSchema = z.object({
  viewerService: z.record(platformTypeSchema, viewerServiceConfigurationSchema),
});

export const workflow: z.infer<typeof workflowSchema> = workflowSchema.parse({
  viewerService: {
    [PlatformType.NICONICO]: {
      defaultURL:
        process.env.WORKFLOW_VIEWER_SERVICE_NICONICO_DEFAULT_URL ?? 'https://www.nicovideo.jp/',
      color: {
        red: process.env.WORKFLOW_VIEWER_SERVICE_NICONICO_COLOR_RED ?? 59,
        green: process.env.WORKFLOW_VIEWER_SERVICE_NICONICO_COLOR_GREEN ?? 59,
        blue: process.env.WORKFLOW_VIEWER_SERVICE_NICONICO_COLOR_BLUE ?? 59,
      },
    },
    [PlatformType.YOUTUBE]: {
      defaultURL:
        process.env.WORKFLOW_VIEWER_SERVICE_YOUTUBE_DEFAULT_URL ?? 'https://www.youtube.com/',
      color: {
        red: process.env.WORKFLOW_VIEWER_SERVICE_YOUTUBE_COLOR_RED ?? 255,
        green: process.env.WORKFLOW_VIEWER_SERVICE_YOUTUBE_COLOR_GREEN ?? 0,
        blue: process.env.WORKFLOW_VIEWER_SERVICE_YOUTUBE_COLOR_BLUE ?? 0,
      },
    },
  },
});
