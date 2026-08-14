import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getQueryDependencies } from '@/services/query-dependencies';
import { FailureError } from '@/utils/failure-error';
import type { ApiNode } from '@/schemas/api-node';
import type { ApiNodeFailure } from './api';

export function useApiNodesQuery() {
  return useQuery<ApiNode[], ApiNodeFailure>({
    queryKey: ['api-nodes'],
    placeholderData: keepPreviousData,
    staleTime: Infinity,
    queryFn: async () => {
      const result = await getQueryDependencies().apiNodeAdapter.queryNodes();
      if (!result.ok) throw new FailureError(result.error);
      return result.data;
    },
  });
}
