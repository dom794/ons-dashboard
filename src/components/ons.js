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

/**
 * Fetches all available editions for a specific dataset.
 */
export async function getEditions(datasetId) {
  const response = await fetch(`${BASE_URL}/datasets/${datasetId}/editions`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return (await response.json()).items || [];
}

/**
 * Fetches all available versions for a specific dataset edition.
 */
export async function getVersions(datasetId, edition) {
  const response = await fetch(`${BASE_URL}/datasets/${datasetId}/editions/${edition}/versions`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return (await response.json()).items || [];
}

/**
 * Fetches all dimensions for a specific dataset version.
 */
export async function getDimensions(datasetId, edition, version) {
  const response = await fetch(`${BASE_URL}/datasets/${datasetId}/editions/${edition}/versions/${version}/dimensions`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return (await response.json()).items || [];
}

/**
 * Fetches the options for a specific dimension.
 * Automatically replaces the absolute ONS API URL with the local Vite proxy.
 */
export async function getOptions(optionsUrl) {
  const proxyUrl = optionsUrl.replace('https://api.beta.ons.gov.uk/v1', BASE_URL);
  const response = await fetch(proxyUrl);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return (await response.json()).items || [];
}

/**
 * Fetches observations for a dataset based on specific dimension filters.
 */
export async function getObservations(datasetId, edition, version, filters) {
  const params = new URLSearchParams(filters);
  const response = await fetch(`${BASE_URL}/datasets/${datasetId}/editions/${edition}/versions/${version}/observations?${params.toString()}`);
  
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HTTP error! status: ${response.status} - ${errText}`);
  }
  return await response.json();
}