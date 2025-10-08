import { ChannelAdaptor, Reader, Translator, Writer } from 'acl/monitoring/channel';
import { HttpClient } from 'aspects/http';
import { acl } from 'config';

export const ACLChannelAdaptorDependencies = ChannelAdaptor(
  HttpClient({ baseURL: `${acl.oneComme.BASE_URI}plugins/one-commentator` }),
  Reader,
  Writer,
  Translator
);
