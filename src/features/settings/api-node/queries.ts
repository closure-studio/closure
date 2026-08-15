import { useQuery } from '@tanstack/react-query';

import { getQueryDependencies } from '@/services/query-dependencies';
import { unwrapResult } from '@/utils/failure-error';
import type { ApiNode } from '@/schemas/api-node';
import type { ApiNodeFailure } from './api';

export function useApiNodesQuery() {
  return useQuery<ApiNode[], ApiNodeFailure>({
    queryKey: ['api-nodes'],
    staleTime: Infinity,
    queryFn: async () =>
      unwrapResult(await getQueryDependencies().apiNodeAdapter.queryNodes()),
  });
}
