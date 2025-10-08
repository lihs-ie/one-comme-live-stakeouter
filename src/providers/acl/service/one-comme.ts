import { Reader, Translator, ViewerServiceAdaptor, Writer } from 'acl/service/one-comme';
import { HttpClient } from 'aspects/http';
import { acl } from 'config';

export const ACLOneCommeAdaptorDependencies = ViewerServiceAdaptor(
  HttpClient({ baseURL: acl.oneComme.BASE_URI }),
  Reader,
  Writer,
  Translator
);
