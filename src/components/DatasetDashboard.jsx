import { useParams } from 'react-router-dom';
import { ONS_DATASETS } from '../data/ONS_DATASETS';
import styles from './DatasetDashboard.module.css';

export default function DatasetDashboard() 
{
  const { datasetId } = useParams();
  const currentDataset = ONS_DATASETS.find(d => d.id === datasetId);
  
  if (currentDataset)
  {
    return (
      <>
        <h1 className={styles.sectionTitle}>{currentDataset.name}</h1>
      </>
    );
  }
  else
  {
    return none;
  }
}