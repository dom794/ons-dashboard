import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ONS_DATASETS } from '../data/ONS_DATASETS';
import { getDatasetMetadata, getObservations } from '../services/onsService';
import styles from './DatasetDashboard.module.css';

export default function DatasetDashboard() 
{
  const { datasetId } = useParams();
  const currentDataset = ONS_DATASETS.find(d => d.id === datasetId);
  return (
    <>
      <h1 className={styles.sectionTitle}>{currentDataset.name}</h1>
    </>
  );
}