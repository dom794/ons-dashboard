import { useState, useEffect, useRef } from "react";
import { fetchTimeSeries } from "../services/ons";

// Simple in-memory cache — persists for the page session
const cache = new Map();

export function useOnsData(metric) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use a stable key so the same metric config always hits the same cache entry
  const cacheKey = JSON.stringify(metric);

  useEffect(() => {
    if (!metric) return;

    // Return cached result immediately if available
    if (cache.has(cacheKey)) {
      setData(cache.get(cacheKey));
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchTimeSeries(
      metric.datasetId,
      metric.edition,
      metric.version,
      metric.dimensionFilters,
    )
      .then((observations) => {
        if (cancelled) return;
        cache.set(cacheKey, observations);
        setData(observations);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Cleanup: if the metric changes before the fetch completes, ignore the old result
    return () => {
      cancelled = true;
    };
  }, [cacheKey]);

  return { data, loading, error };
}
