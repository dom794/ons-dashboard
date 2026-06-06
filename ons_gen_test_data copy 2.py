import os
import requests
import json
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

class ONSApiClient:
    BASE_URL = "https://api.beta.ons.gov.uk/v1"

    def __init__(self, data_dir="dashboard_cache"):
        """
        Initializes the ONS API Client with an automatic retry strategy
        to handle 429 rate limits and 5xx server issues.
        """
        self.data_dir = data_dir
        os.makedirs(self.data_dir, exist_ok=True)
        
        # Set up a robust session with backoff retries
        self.session = requests.Session()
        retry_strategy = Retry(
            total=5,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504]
        )
        self.session.mount("https://", HTTPAdapter(max_retries=retry_strategy))

    def get_datasets(self):
        """Fetches the root list of available datasets from ONS."""
        url = f"{self.BASE_URL}/datasets"
        response = self.session.get(url)
        response.raise_for_status()
        return response.json().get("items", [])

    def get_latest_version_metadata(self, dataset_id):
        """
        Finds the latest available release version and edition for a dataset.
        Returns the full version metadata object or None.
        """
        url = f"{self.BASE_URL}/datasets/{dataset_id}"
        response = self.session.get(url)
        if response.status_code != 200:
            return None
            
        dataset_meta = response.json()
        latest_version_href = dataset_meta.get("links", {}).get("latest_version", {}).get("href")
        
        if not latest_version_href:
            return None
            
        version_response = self.session.get(latest_version_href)
        return version_response.json() if version_response.status_code == 200 else None

    def get_dimensions(self, dataset_id, edition, version):
        """Fetches all valid filtering dimensions for a specific dataset version."""
        url = f"{self.BASE_URL}/datasets/{dataset_id}/editions/{edition}/versions/{version}/dimensions"
        response = self.session.get(url)
        return response.json().get("items", []) if response.status_code == 200 else []

    def get_dimension_options(self, options_url):
        """Fetches the allowable filter codes and labels from a dimension's options URL."""
        response = self.session.get(options_url)
        return response.json().get("items", []) if response.status_code == 200 else []

    def get_human_readable_options(self, options_url):
        """
        Fetches the options for a dimension and formats them in a human-readable way.
        Returns a list of dictionaries with 'label' and 'code'.
        """
        options = self.get_dimension_options(options_url)
        return [{"label": opt.get("label"), "code": opt.get("option")} for opt in options]

    def get_all_dataset_options(self, dataset_id, edition, version):
        """
        Retrieves all dimensions and their human-readable options for a specific dataset version.
        Returns a dictionary mapping dimension names to their options.
        """
        dimensions = self.get_dimensions(dataset_id, edition, version)
        all_options = {}
        
        for dim in dimensions:
            dim_name = dim.get("name")
            opts_url = dim.get("links", {}).get("options", {}).get("href")
            all_options[dim_name] = {
                "label": dim.get("label", dim_name),
                "options": self.get_human_readable_options(opts_url) if opts_url else []
            }
                
        return all_options

    def get_observations(self, dataset_id, edition, version, query_params):
        """
        Queries the actual data observations using precise dimension code filters.
        Pass '*' to a dimension (like time) to fetch a full series for a chart.
        """
        url = f"{self.BASE_URL}/datasets/{dataset_id}/editions/{edition}/versions/{version}/observations"

        print(url)
        response = self.session.get(url, params=query_params)
        print(response.content)
        if response.status_code == 200:
            return response.json()
        return None


# =====================================================================
# Demonstration & Testing Block
# =====================================================================
if __name__ == "__main__":
    print("--- Initializing ONS Client ---")
    ons = ONSApiClient(data_dir="dashboard_cache")

    # Step 1: Target a specific dataset (Consumer Price Inflation)
    target_dataset = "wellbeing-quarterly"
    target_dataset = "suicides-in-the-uk"
    print(f"Targeting dataset: {target_dataset}")

    # Step 2: Resolve latest version pathways automatically
    print("\nFetching latest version layout...")
    latest_meta = ons.get_latest_version_metadata(target_dataset)
    
    if not latest_meta:
        print(f"Could not retrieve metadata for {target_dataset}. Exiting.")
        exit(1)

    edition = latest_meta.get("edition")
    version = latest_meta.get("version")
    print(f"-> Active Target: Edition '{edition}', Version {version}")

    # Step 3: Fetch structural dimensions to understand the query constraints
    print("\nDiscovering selectable filters (dimensions) and their options...")
    all_opts = ons.get_all_dataset_options(target_dataset, edition, version)

    for dim_name, info in all_opts.items():
        print(f"\nDimension: {info['label']} (API key: '{dim_name}')")
        for opt in info['options'][:5]:  # Display up to 5 options for readability
            print(f"  - {opt['label']} -> Code: '{opt['code']}'")
        if len(info['options']) > 5:
            print(f"  ... and {len(info['options']) - 5} more options")

    print("\n------")
    
    filters = {}

    for dim_name, info in all_opts.items():
        options = info['options']
        if options:
            first_option_code = options[0]['code']
            
            # Assign a wildcard to time, and an explicit valid code to everything else
            if dim_name.lower() == 'time':
                filters[dim_name] = '*'
            else:
                filters[dim_name] = first_option_code

    # Step 4: Run a mock dashboard query
    # We use '*' on time to pull a historical timeline for our charts
    print("\nQuerying dynamic data observations...")
    print(f"Applying strict filters: {filters}")
    
    raw_data = ons.get_observations(target_dataset, edition, version, filters)
    
    # Step 5: Format the data for a chart backend
    chart_ready_points = []
    if raw_data:
        for obs in raw_data.get("observations", []):
            time_label = obs.get("dimensions", {}).get("Time", {}).get("label")
            value = obs.get("observation")
            if time_label and value:
                chart_ready_points.append({
                    "date": time_label,
                    "value": float(value)
                })
        
        # Sort data chronologically for clean plotting lines
        chart_ready_points = sorted(chart_ready_points, key=lambda x: x["date"])
        
        print("\nSuccess! Sample dataset slice ready for frontend charting library:")
        for point in chart_ready_points[:5]:
            print(f"  Date: {point['date']} -> Inflation Value: {point['value']}")
    else:
        print("Query returned no data. Check that filter codes match exactly.")
