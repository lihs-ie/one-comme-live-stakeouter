import { z } from 'zod/mini';

const aclSchema = z.object({
  youtube: z.object({
    BASE_URI: z.url(),
    API_KEY: z.string(),
  }),
  niconico: z.object({
    BASE_URI: z.url(),
    USER_AGENT: z.string(),
  }),
});

export const acl = aclSchema.parse({
  youtube: {
    BASE_URI: process.env.ACL_YOUTUBE_BASE_URI,
    API_KEY: process.env.ACL_YOUTUBE_API_KEY,
  },
  niconico: {
    BASE_URI: process.env.ACL_NICONICO_BASE_URI,
    USER_AGENT: process.env.ACL_NICONICO_USER_AGENT,
  },
});
