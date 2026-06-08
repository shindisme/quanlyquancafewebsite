import { useEffect, useRef } from 'react';

export const useAutoRefresh = (
  fetchFn: () => void,
  intervalMs: number = 15000 // 15 giây
) => {
  const savedFn = useRef(fetchFn);
  savedFn.current = fetchFn;

  useEffect(() => {
    const id = setInterval(() => savedFn.current(), intervalMs);
    return () => clearInterval(id); // Cleanup khi unmount
  }, [intervalMs]);
};
