// A lightweight in-memory cache to store responses during the active session
const apiCache = new Map();

/**
 * Helper to fetch with caching capabilities
 */
async function fetchWithCache(url) {
  if (apiCache.has(url)) {
    return apiCache.get(url);
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error(`ONS network error: ${response.status}`);
  const data = await response.json();
  apiCache.set(url, data);
  return data;
}

/**
 * Step 1: Get the base dataset version metadata and its required dimension schemas
 */
export async function getDatasetMetadata(datasetId) {
  const rootData = await fetchWithCache(`https://api.beta.ons.gov.uk/v1/datasets/${datasetId}`);
  const latestVersionUrl = rootData.links?.latest_version?.href;
  if (!latestVersionUrl) throw new Error("Latest dataset version could not be found.");

  const dimensionsData = await fetchWithCache(`${latestVersionUrl}/dimensions`);
  
  // Fetch options for every dimension parallelly
  const dimensionsWithOptions = await Promise.all(
    (dimensionsData.items || []).map(async (dim) => {
      const dimId = dim.id || dim.name;
      const optionsData = await fetchWithCache(`${latestVersionUrl}/dimensions/${dimId}/options`);
      return {
        id: dimId,
        label: dim.label || dimId,
        options: (optionsData.items || []).map(opt => ({
          value: opt.option,
          label: opt.label || opt.option
        }))
      };
    })
  );

  return {
    latestVersionUrl,
    dimensions: dimensionsWithOptions
  };
}

/**
 * Step 2: Fetch the actual time-series observations based on user-selected criteria
 */
export async function getObservations(latestVersionUrl, selectedFilters) {
  const queryParams = Object.entries(selectedFilters)
    .map(([key, val]) => `${key}=${val}`)
    .join('&');

  const url = `${latestVersionUrl}/observations?${queryParams}`;
  const obsData = await fetchWithCache(url);

  if (!obsData.observations || obsData.observations.length === 0) {
    throw new Error("No observations returned for this specific filter matrix configuration.");
  }

  // Parse, normalize, and sort time series chronologically
  return obsData.observations
    .map(item => {
      const numericalVal = parseFloat(item.observation);
      return {
        period: item.dimensions?.time?.label || item.dimensions?.Time?.label || "Unknown",
        value: isNaN(numericalVal) ? null : numericalVal,
        geo: item.dimensions?.geography?.label || ""
      };
    })
    .filter(point => point.value !== null)
    .reverse();
}