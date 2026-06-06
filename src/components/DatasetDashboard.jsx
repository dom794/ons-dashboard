import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ONS_DATASETS } from '../data/ONS_DATASETS';
import { getDataset, getEditions, getVersions, getDimensions, getOptions, getObservations } from './ons';
import styles from './DatasetDashboard.module.css';

export default function DatasetDashboard() 
{
  const { datasetId } = useParams();
  const currentDataset = ONS_DATASETS.find(d => d.id === datasetId);

  const [datasetMeta, setDatasetMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for Editions & Versions
  const [editions, setEditions] = useState([]);
  const [selectedEdition, setSelectedEdition] = useState('');
  
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState('');

  // State for Dimensions & Filters
  const [dimensions, setDimensions] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [loadingDimensions, setLoadingDimensions] = useState(false);

  // State for fetched observations
  const [observationsData, setObservationsData] = useState(null);
  const [fetchingData, setFetchingData] = useState(false);
  const [dataError, setDataError] = useState(null);

  useEffect(() => {
    if (!datasetId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const datasetData = await getDataset(datasetId);
        setDatasetMeta(datasetData);
        
        // Fetch editions as soon as the dataset loads
        const editionsData = await getEditions(datasetId);
        setEditions(editionsData);
        
        if (editionsData.length > 0) {
          setSelectedEdition(editionsData[0].edition);
        } else {
          setSelectedEdition('');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [datasetId]);

  // Fetch versions whenever the selected edition changes
  useEffect(() => {
    if (!datasetId || !selectedEdition) return;

    const fetchVersionData = async () => {
      setVersions([]);
      setSelectedVersion('');
      try {
        const versionsData = await getVersions(datasetId, selectedEdition);
        setVersions(versionsData);
        
        if (versionsData.length > 0) {
          setSelectedVersion(versionsData[0].version.toString());
        } else {
          setSelectedVersion('');
        }
      } catch (err) {
        console.error('Error fetching versions:', err);
      }
    };

    fetchVersionData();
  }, [datasetId, selectedEdition]);

  // Fetch dimensions and options whenever the selected version changes
  useEffect(() => {
    if (!datasetId || !selectedEdition || !selectedVersion) return;

    const fetchDimensionsData = async () => {
      setLoadingDimensions(true);
      setDimensions([]);
      try {
        const dims = await getDimensions(datasetId, selectedEdition, selectedVersion);
        
        // Fetch options for all dimensions concurrently
        const dimensionsWithOptions = await Promise.all(
          dims.map(async (dim) => {
            const optionsUrl = dim.links?.options?.href;
            const options = optionsUrl ? await getOptions(optionsUrl) : [];
            return { ...dim, options };
          })
        );

        setDimensions(dimensionsWithOptions);

        // Auto-select the first option for every dimension to initialize our filters
        const defaultFilters = {};
        dimensionsWithOptions.forEach(dim => {
          if (dim.options && dim.options.length > 0) {
            defaultFilters[dim.name] = dim.options[0].option;
          }
        });
        setSelectedFilters(defaultFilters);
      } catch (err) {
        console.error('Error fetching dimensions:', err);
      } finally {
        setLoadingDimensions(false);
      }
    };

    fetchDimensionsData();
  }, [datasetId, selectedEdition, selectedVersion]);

  const handleFilterChange = (dimensionName, value) => {
    setSelectedFilters(prev => ({ ...prev, [dimensionName]: value }));
  };

  // Clear out stale observation data when the user changes a filter
  useEffect(() => {
    setObservationsData(null);
    setDataError(null);
  }, [selectedFilters, selectedVersion]);

  const handleFetchData = async () => {
    if (!datasetId || !selectedEdition || !selectedVersion) return;
    setFetchingData(true);
    setDataError(null);
    setObservationsData(null);
    try {
      const data = await getObservations(datasetId, selectedEdition, selectedVersion, selectedFilters);
      setObservationsData(data);
    } catch (err) {
      console.error('Error fetching observations:', err);
      setDataError(err.message);
    } finally {
      setFetchingData(false);
    }
  };
  
  if (currentDataset)
  {
    return (
      <>
        <h1 className={styles.sectionTitle}>{currentDataset.name}</h1>
        
        {loading && <p>Loading dataset details from ONS...</p>}
        {error && <p style={{ color: 'red' }}>Error loading data: {error}</p>}
        {datasetMeta && (
          <div className={styles.apiData}>
            <h3>Live Metadata</h3>
            <p><strong>Description:</strong> {datasetMeta.description}</p>
            <p><strong>Next Release:</strong> {datasetMeta.next_release || "Not scheduled"}</p>
            
            {/* Selection Controls */}
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
              
              <div>
                <label htmlFor="edition-select" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Edition:</label>
                <select 
                  id="edition-select" 
                  value={selectedEdition} 
                  onChange={(e) => setSelectedEdition(e.target.value)}
                  style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#0f172a' }}
                >
                  {editions.map(ed => (
                    <option key={ed.edition} value={ed.edition}>{ed.edition}</option>
                  ))}
                </select>
              </div>

              {selectedEdition && (
                <div>
                  <label htmlFor="version-select" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Version:</label>
                  <select 
                    id="version-select" 
                    value={selectedVersion} 
                    onChange={(e) => setSelectedVersion(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#0f172a' }}
                  >
                    {versions.map(v => (
                      <option key={v.version} value={v.version}>
                        Version {v.version} {v.release_date ? `(${v.release_date.split('T')[0]})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Dimensions & Filters Section */}
            {selectedVersion && (
              <div style={{ marginTop: '2rem' }}>
                <h4 style={{ marginBottom: '1rem', fontWeight: 600 }}>Data Filters</h4>
                
                {loadingDimensions && <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Loading filter options...</p>}
                
                {!loadingDimensions && dimensions.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                    {dimensions.map(dim => (
                      <div key={dim.id || dim.name}>
                        <label htmlFor={`filter-${dim.name}`} style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
                          {dim.label || dim.name}:
                        </label>
                        <select
                          id={`filter-${dim.name}`}
                          value={selectedFilters[dim.name] || ''}
                          onChange={(e) => handleFilterChange(dim.name, e.target.value)}
                          style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#0f172a', maxWidth: '250px' }}
                        >
                          <option value="*">All (*) - Max 1 wildcard</option>
                          {dim.options && dim.options.map(opt => (
                            <option key={opt.option} value={opt.option}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}

                {/* Fetch Button */}
                {!loadingDimensions && dimensions.length > 0 && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <button 
                      onClick={handleFetchData}
                      disabled={fetchingData}
                      style={{ 
                        padding: '0.5rem 1rem', 
                        backgroundColor: '#1e40af', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '0.375rem', 
                        fontWeight: 600, 
                        cursor: fetchingData ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {fetchingData ? 'Fetching Data...' : 'Fetch Observations'}
                    </button>
                    {dataError && <p style={{ color: '#dc2626', marginTop: '0.5rem', fontSize: '0.875rem' }}>{dataError}</p>}
                  </div>
                )}
              </div>
            )}

            {/* Observation Results Table */}
            {observationsData && observationsData.observations && (
              <div style={{ marginTop: '2rem' }}>
                <h4 style={{ marginBottom: '1rem', fontWeight: 600 }}>Data Results</h4>
                <div className={styles.tableContainer}>
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th className={styles.th}>Value</th>
                          {dimensions.map(dim => (
                            <th key={dim.name} className={styles.th}>{dim.label || dim.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {observationsData.observations.map((obs, idx) => (
                          <tr key={idx}>
                            <td className={styles.td} style={{ fontWeight: 700, color: '#0f172a' }}>{obs.observation}</td>
                            {dimensions.map(dim => {
                              // ONS API tends to capitalize dimension names in the response object
                              const dimKey = Object.keys(obs.dimensions || {}).find(k => k.toLowerCase() === dim.name.toLowerCase());
                              const dimObj = dimKey ? obs.dimensions[dimKey] : null;
                              return <td key={dim.name} className={styles.td}>{dimObj ? dimObj.label : selectedFilters[dim.name]}</td>;
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </>
    );
  }
  else
  {
    return null;
  }
}