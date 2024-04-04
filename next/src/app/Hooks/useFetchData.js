import { useState, useEffect, useCallback } from 'react';

export const useFetchData = (fetchFunction) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fetchedData = await fetchFunction();
      setData(fetchedData);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, fetchData };
};