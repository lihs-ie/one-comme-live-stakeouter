import { ACLViewerServiceRepository } from 'infrastructures/service';
import { ACLProvider } from 'providers/acl';

export const ViewerServiceDependencies = ACLViewerServiceRepository(ACLProvider.service);
