import { defaultEndpoints } from "../data/endpoints";
import styles from "./Footer.module.css";

export default function Footer() 
{
  return (
    <footer className={styles.footer}>
      <div className={styles.mainContent}>
        <div>
          <div className={styles.brandContainer}>
            <div className={styles.logoIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="12" width="4" height="9" fill="white" opacity="0.9"/>
                <rect x="10" y="7" width="4" height="14" fill="white" opacity="0.9"/>
                <rect x="17" y="3" width="4" height="18" fill="white" opacity="0.9"/>
              </svg>
            </div>
            <span className={styles.brandName}>
              UK Public Data
            </span>
          </div>
          <p className={styles.brandDescription}>
            An open-source dashboard built on publicly available UK government
            data. Not affiliated with ONS or any government body.
          </p>
        </div>
      </div>
      <div className={styles.bottomBar}>
        <span className={styles.bottomText}>
          © {new Date().getFullYear()} UK Public Data Dashboard. Built with
          React + ONS Beta API.
        </span>
        <span className={styles.bottomText}>
          Data © Office for National Statistics — Open Government Licence
        </span>
      </div>
    </footer>
  );
}
