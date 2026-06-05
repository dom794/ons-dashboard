import styles from "./Header.module.css";
import { defaultEndpoints } from "../data/endpoints";

export default function Header() 
{

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
          <select 
            className={styles.dropdown}
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) window.location.href = `/datasets/${e.target.value}`;
            }}
          >
            <option value="" disabled>Browse datasets...</option>
            {defaultEndpoints.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </nav>
      </div>
    </header>
  );
}
