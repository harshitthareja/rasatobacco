import { useCallback, useEffect, useState } from "react";
import { adminData } from "./api";

export type Paged<T> = { data: T[]; count: number };

/** Loads one page of an admin-data section and re-fetches when inputs change. */
export function usePaged<T>(
  section: string,
  query: Record<string, string | number | undefined> = {},
) {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Paged<T> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify(query);

  useEffect(() => setPage(1), [key]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminData<Paged<T>>(section, { ...JSON.parse(key), page });
      setResult({ data: res.data ?? [], count: res.count ?? 0 });
    } catch (e) {
      setError((e as Error).message);
    }
    setLoading(false);
  }, [section, key, page]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    page,
    setPage,
    rows: result?.data ?? [],
    count: result?.count ?? 0,
    error,
    loading,
    reload: load,
  };
}
