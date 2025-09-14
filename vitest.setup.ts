import { vi } from 'vitest';
import createFetchMock from 'vitest-fetch-mock';

import './src/tests/expect';

const fetchMocker = createFetchMock(vi);

fetchMocker.enableMocks();
