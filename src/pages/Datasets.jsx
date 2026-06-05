
import { ONS_DATASETS } from '../data/ONS_DATASETS';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useParams } from 'react-router-dom';
import styles from './Datasets.module.css';

export default function Datasets() 
{
  return (
    <div className={styles.dashboardContainer}>
      
      {/* LEFT SIDEBAR: ONS Dataset List */}
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>ONS Datasets</h2>
        <nav className={styles.navList}>
          {ONS_DATASETS.map((dataset) => (
            <NavLink
              key={dataset.id}
              to={`/datasets/${dataset.id}`}
              // NavLink gives us an isActive boolean automatically
              className={({ isActive }) => 
                isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink
              }
            >
              {dataset.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* RIGHT DISPLAY AREA: Displays the selected data charts */}
      <main className={styles.mainContent}>
        <Outlet />
      </main>

    </div>
  );
}