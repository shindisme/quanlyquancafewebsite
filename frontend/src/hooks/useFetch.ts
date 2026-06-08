import { useState, useEffect, useCallback, useRef } from 'react';

export const useFetch = (service: any, params?: any) => {
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const paramsKey = params ? JSON.stringify(params) : '';
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await service.getAll(paramsRef.current);

      if (response && response.items) {
        setData(response.items);
        setMeta({
          totalCount: response.totalCount,
          totalPages: response.totalPages,
          currentPage: response.currentPage,
        });
      } else if (response && response.data) {
        setData(response.data);
      } else if (Array.isArray(response)) {
        setData(response);
      } else {
        setData([]);
      }
      setError(null);
    } catch (err) {
      setError(err);
      setData([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service, paramsKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, meta, loading, error, refetch: fetchData };
};
