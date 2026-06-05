import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchAndSave() 
{
    try 
    {
        console.log("Fetching datasets from ONS API...");
        let allDatasets = [];
        let offset = 0;
        const limit = 50;
        let hasMore = true;

    // Loop to handle pagination and fetch every dataset
    while (hasMore) 
    {
        const response = await fetch(`https://api.beta.ons.gov.uk/v1/datasets?limit=${limit}&offset=${offset}`);
        
        if (!response.ok)
            throw new Error(`API error: ${response.status}`);

        const data = await response.json();

        if (data?.items?.length > 0) 
        {
            allDatasets.push(...data.items);
            offset += limit;
        } 
        else 
        {
            hasMore = false;
        }
    }

    // Map to just id and name
    const endpoints = allDatasets.map(item => ({id: item.id,name: item.title}));

    const outputPath = path.join(__dirname, './src/data/endpoints.json');
    fs.writeFileSync(outputPath, JSON.stringify(endpoints, null, 2));
    console.log(`Successfully saved ${endpoints.length} datasets to ${outputPath}`);
  }
  catch (error) 
  {
    console.error("Failed to fetch and save endpoints", error);
  }
}

fetchAndSave();