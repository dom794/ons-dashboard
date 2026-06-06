/**
 * Base URL for the ONS API, utilizing the Vite proxy setup in vite.config.js
 */
const BASE_URL = '/api/ons';

/**
 * Fetches the metadata for a specific dataset.
 * 
 * @param {string} datasetId - The ID of the dataset to fetch
 * @returns {Promise<Object>} The dataset metadata
 */
export async function getDataset(datasetId) {
  const response = await fetch(`${BASE_URL}/datasets/${datasetId}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

// You can easily add more functions here later, such as:
// export async function getEditions(datasetId) { ... }
// export async function getVersions(datasetId, edition) { ... }