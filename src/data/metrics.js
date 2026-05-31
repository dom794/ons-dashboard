export const METRICS = [
  {
    id: "inflation",
    label: "Inflation (CPIH)",
    datasetId: "cpih01",
    edition: "time-series",
    version: "6",
    // Fixed dimensions — the ones that aren't the wildcard
    dimensionFilters: {
      geography: "K02000001", // UK
      aggregate: "cpih1dim1A0", // All items
    },
    unit: "Index (2015=100)",
    description:
      "Consumer Prices Index including owner occupiers housing costs",
  },
  // Add more metrics here — e.g. unemployment, GDP, etc.
  // Each entry maps to one ONS dataset + a set of fixed dimension values.
];

// ONS geography codes for UK regions (used for map views)
export const UK_REGIONS = [
  { id: "K02000001", label: "United Kingdom" },
  { id: "E92000001", label: "England" },
  { id: "S92000003", label: "Scotland" },
  { id: "W92000004", label: "Wales" },
  { id: "N92000002", label: "Northern Ireland" },
];
