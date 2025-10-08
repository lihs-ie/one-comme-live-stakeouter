import {
  LiveStreamReader,
  NicoNicoAdaptor,
  ProgramReader,
  Translator,
} from 'acl/live-stream/niconico';
import { HttpClient } from 'aspects/http';
import { acl } from 'config';

export const ACLNicoNicoAdaptorDependencies = NicoNicoAdaptor(
  HttpClient({ baseURL: acl.niconico.BASE_URI }),
  acl.niconico.USER_AGENT,
  ProgramReader,
  LiveStreamReader,
  Translator(acl.niconico.USER_AGENT)
);
