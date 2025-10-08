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
  oneComme: z.object({
    BASE_URI: z.url(),
  }),
});

export const acl: z.infer<typeof aclSchema> = aclSchema.parse({
  youtube: {
    BASE_URI: process.env.ACL_YOUTUBE_BASE_URI,
    API_KEY: process.env.ACL_YOUTUBE_API_KEY,
  },
  niconico: {
    BASE_URI: process.env.ACL_NICONICO_BASE_URI,
    USER_AGENT: process.env.ACL_NICONICO_USER_AGENT,
  },
  oneComme: {
    BASE_URI: process.env.ACL_ONE_COMME_BASE_URI,
  },
});
