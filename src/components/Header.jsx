import styles from "./Header.module.css";
import React from "react";
import { NavLink, useLocation } from "react-router-dom";

export default function Header() 
{
  const location = useLocation();
  const isHomeActive = !location.pathname.startsWith("/about");

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div>
          <div className={styles.title}>
            UK Public Data
          </div>
          <div className={styles.subtitle}>
            Dashboard
          </div>
        </div>
        <nav className={styles.nav}>
          <NavLink to="/datasets" className={styles.navItem}>Home</NavLink>
          <NavLink to="/about" className={styles.navItem}>About</NavLink>
        </nav>
      </div>
    </header>
  );
}
