import { Reader, Translator, YoutubeAdaptor } from 'acl/live-stream/youtube';
import { HttpClient } from 'aspects/http';
import { acl } from 'config';

export const ACLYoutubeAdaptorDependencies = YoutubeAdaptor(
  HttpClient({ baseURL: acl.youtube.BASE_URI }),
  acl.youtube.API_KEY,
  Reader,
  Translator(acl.youtube.BASE_URI)
);
