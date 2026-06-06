import os
import random
import requests
import time
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
        raw_items = response.json().get("items", [])
                
        # Strip out the noise and return only what your UI setup requires
        return [
            {
                "id": item.get("id"),
                "title": item.get("title"),
                "description": item.get("description")
            }
            for item in raw_items if item.get("id")
        ]

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
    
    def get_editions(self, dataset_id):
        """
        Fetches all structural editions available for a specific dataset,
        removing the heavy hypermedia metadata tracking blocks.
        
        Output format: [{'edition': 'time-series', 'label': 'Time Series'}, ...]
        """
        url = f"{self.BASE_URL}/datasets/{dataset_id}/editions"
        response = self.session.get(url)
        if response.status_code != 200:
            print(f"Failed to fetch editions for dataset '{dataset_id}'. Status: {response.status_code}")
            return []
            
        raw_editions = response.json().get("items", [])
        
        return [
            {
                "edition": item.get("edition"),
                "label": item.get("label")
            }
            for item in raw_editions if item.get("edition")
        ]
    
    def get_versions(self, dataset_id, edition):
        """
        Fetches all available versions for a specific dataset edition, 
        sorted from newest release to oldest release.
        """
        url = f"{self.BASE_URL}/datasets/{dataset_id}/editions/{edition}/versions"
        response = self.session.get(url)
        if response.status_code != 200:
            return []
            
        raw_versions = response.json().get("items", [])
        clean_versions = [
            {
                "version": item.get("version"),
                "release_date": item.get("release_date", "Unknown")
            }
            for item in raw_versions if "version" in item
        ]
        return sorted(clean_versions, key=lambda x: x["version"], reverse=True)

    def get_observations(self, dataset_id, edition, version, query_params):
        """
        Queries the actual data observations using precise dimension code filters
        and saves the raw payload to a local cache directory as a JSON file.
        """
        url = f"{self.BASE_URL}/datasets/{dataset_id}/editions/{edition}/versions/{version}/observations"
        response = self.session.get(url, params=query_params)
        
        if response.status_code == 200:
            data = response.json()
            
            # --- SAVE RESPONSE AS JSON FILE ---
            # 1. Turn query params into a clean string for the filename (e.g., "time-star_sex-all")
            # Replace wildcards '*' with 'star' to prevent OS file naming issues
            param_str = "_".join([f"{k}-{str(v).replace('*', 'star')}" for k, v in query_params.items()])
            
            # 2. Construct a descriptive, safe filename
            filename = f"obs_{dataset_id}_{edition}_v{version}_{param_str}.json"
            filepath = os.path.join(self.data_dir, filename)
            
            # 3. Save the JSON data out cleanly indented
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=4)
                
            print(f" Saved ONS raw observation payload to: {filepath}")
            return data
            
        else:
            print(f"Failed to fetch observations. Status code: {response.status_code}")
            print(response.content)
            return None

    # =================================================================
    # FILTER API METHODS (Asynchronous Custom File Generation)
    # =================================================================

    def create_filter_blueprint(self, dataset_id, edition, version):
        """
        Step 1: Create a new filter blueprint for a dataset version.
        Returns the unique filter blueprint ID.
        """
        url = f"{self.BASE_URL}/filters"
        payload = {
            "dataset": {
                "id": dataset_id,
                "edition": edition,
                "version": int(version)
            }
        }
        response = self.session.post(url, json=payload)
        if response.status_code in [200, 201]:
            return response.json().get("filter_id")
        
        print(f"Failed to create filter blueprint. Status: {response.status_code}")
        return None

    def add_filter_option(self, filter_id, dimension_name, option_code):
        """
        Step 2: Add a specific dimension option to the filter blueprint.
        (e.g. dimension_name='geography', option_code='K02000001')
        """
        url = f"{self.BASE_URL}/filters/{filter_id}/dimensions/{dimension_name}/options/{option_code}"
        # ONS API requires the If-Match header to mutate an existing filter blueprint
        response = self.session.post(url, headers={"If-Match": "*"})
        
        if response.status_code not in [200, 201, 204]:
            print(f"Failed to add option '{option_code}' to '{dimension_name}'. Status: {response.status_code}")
            print(f"Error details: {response.text}")
        return response.status_code in [200, 201, 204]

    def submit_filter(self, filter_id):
        """
        Step 3: Submit the filter blueprint to generate a filter output.
        Returns the filter_output_id needed to check the job status.
        """
        # Using the standard ?submitted=true query flag to lock and submit the blueprint
        url = f"{self.BASE_URL}/filters/{filter_id}?submitted=true"
        response = self.session.put(url, headers={"If-Match": "*"}, json={}) 
        
        if response.status_code == 200:
            links = response.json().get("links", {})
            filter_output_url = links.get("filter_output", {}).get("href")
            if filter_output_url:
                # Extract the ID from the very end of the href
                return filter_output_url.split("/")[-1]
                
        print(f"Failed to submit filter. Status: {response.status_code}")
        print(f"Error details: {response.text}")
        return None

    def get_filter_output(self, filter_output_id):
        """
        Step 4: Check the status of the generated filter output.
        Look for state: 'completed' to access the final 'downloads' links.
        """
        url = f"{self.BASE_URL}/filter-outputs/{filter_output_id}"
        response = self.session.get(url)
        return response.json() if response.status_code == 200 else None


# =====================================================================
# Demonstration & Testing Block
# =====================================================================
if __name__ == "__main__":
    ons = ONSApiClient(data_dir="dashboard_cache")


    print("--- ONS Datasets ---")
    datasets = ons.get_datasets()
    
    for item in ons.get_datasets():
        pass # Hiding the print dump to keep the console clean

    target_dataset = datasets[random.randint(0,len(datasets)-1)]
    dataset_id = target_dataset.get('id')
    
    print(f"--- Target Dataset: {dataset_id} ---")

    dataset_editions = ons.get_editions(dataset_id)
    if not dataset_editions:
        exit()

    target_edition = dataset_editions[random.randint(0,len(dataset_editions)-1)]
    edition = target_edition.get('edition')
    print(f"--- Target Edition: {edition} ---")

    dataset_versions = ons.get_versions(dataset_id, edition)
    if not dataset_versions:
        exit()

    target_version = dataset_versions[random.randint(0,len(dataset_versions)-1)]
    version = target_version.get('version')
    print(f"--- Target Version: {version} ---")

    print(f"\n--- 1. Creating Filter Blueprint ---")
    filter_id = ons.create_filter_blueprint(dataset_id, edition, version)
    if not filter_id:
        print("Failed to create blueprint. Exiting.")
        exit(1)
    print(f"Created Blueprint ID: {filter_id}")

    print("\n--- 2. Adding Filter Options ---")
    dataset_dimensions = ons.get_dimensions(dataset_id, edition, version)
    
    for dim in dataset_dimensions:
        dim_name = dim.get('name')
        opts_url = dim.get('links', {}).get('options', {}).get('href')
        
        options = ons.get_dimension_options(opts_url)
        if options:
            # Pick the first option available for this dimension to keep it simple
            opt_code = options[0].get('option')
            print(f"Adding {dim_name} -> {opt_code}")
            ons.add_filter_option(filter_id, dim_name, opt_code)

    print("\n--- 3. Submitting Filter Job ---")
    output_id = ons.submit_filter(filter_id)
    if not output_id:
        print("Failed to submit filter. Exiting.")
        exit(1)
    print(f"Submitted Job. Output ID: {output_id}")

    print("\n--- 4. Waiting for Custom File Generation ---")
    while True:
        output_status = ons.get_filter_output(output_id)
        if not output_status:
            print("Error checking status.")
            break
            
        state = output_status.get("state")
        print(f"Current state: {state}...")
        
        if state == "completed":
            csv_link = output_status.get("downloads", {}).get("csv", {}).get("href")
            print(f"\nDONE! Your custom CSV is ready here:\n{csv_link}")
            break
        elif state == "failed":
            print("\nThe filter job failed on the ONS servers.")
            break
            
        time.sleep(3) # Wait 3 seconds before polling again