const BASE = import.meta.env.DEV ? "/api/ons" : "https://api.beta.ons.gov.uk/v1";

/**
 * Fetch the list of available datasets from ONS.
 * Useful for populating a metric selector on load.
 */
export async function fetchDatasets() {
  const res = await fetch(`${BASE}/datasets`);
  if (!res.ok) throw new Error(`ONS datasets error: ${res.status}`);
  const json = await res.json();
  return json.items; // array of { id, title, description, ... }
}

/**
 * Fetch the dimensions for a given dataset version.
 * You need this to know what filters are available before querying.
 *
 * Example: fetchDimensions('cpih01', 'time-series', '6')
 * Returns: [{ id: 'time', ... }, { id: 'geography', ... }, { id: 'aggregate', ... }]
 */
export async function fetchDimensions(datasetId, edition, version) {
  const res = await fetch(
    `${BASE}/datasets/${datasetId}/editions/${edition}/versions/${version}/dimensions`,
  );
  if (!res.ok) throw new Error(`ONS dimensions error: ${res.status}`);
  const json = await res.json();
  return json.items;
}

/**
 * Fetch a time series by setting time=* (wildcard).
 * All other dimensions must be given a specific option value.
 *
 * dimensionFilters example:
 *   { geography: 'K02000001', aggregate: 'cpih1dim1A0' }
 *
 * Returns an array of { label: 'Jan-20', value: '105.1' } objects,
 * sorted chronologically and ready to pass straight into Recharts.
 */
export async function fetchTimeSeries(
  datasetId,
  edition,
  version,
  dimensionFilters,
) {
  const params = new URLSearchParams({ time: "*", ...dimensionFilters });
  const url = `${BASE}/datasets/${datasetId}/editions/${edition}/versions/${version}/observations?${params}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`ONS observations error: ${res.status}`);
  const json = await res.json();

  // The API returns observations as an array of objects.
  // Each has a `dimensions` block (with the time label) and an `observation` value.
  return json.observations.map((obs) => ({
    label: obs.dimensions.time.label, // e.g. "Oct-11"
    value: parseFloat(obs.observation),
  }));
}

/**
 * Fetch observations for all geography codes in parallel.
 * Use this to build a choropleth map — one value per region.
 *
 * geoCodes example: ['E12000001', 'E12000002', 'E12000003', ...]
 * (ONS region codes for English regions, Scotland, Wales, NI)
 */
export async function fetchByGeography(
  datasetId,
  edition,
  version,
  geoCodes,
  otherFilters,
) {
  const results = await Promise.all(
    geoCodes.map(async (geoCode) => {
      const params = new URLSearchParams({
        ...otherFilters,
        geography: geoCode,
      });
      const url = `${BASE}/datasets/${datasetId}/editions/${edition}/versions/${version}/observations?${params}`;
      const res = await fetch(url);
      if (!res.ok) return { geoCode, value: null };
      const json = await res.json();
      const obs = json.observations?.[0];
      return { geoCode, value: obs ? parseFloat(obs.observation) : null };
    }),
  );
  return results;
}
