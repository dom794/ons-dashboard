import { useEffect, useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Header from "./components/Header";
import Footer from "./components/Footer";
import styles from "./App.module.css";

function useIsMobile()
{
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => 
  {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

const BASE = "https://api.beta.ons.gov.uk/v1";

function Chart({ data, isMobile }) {
  if (!data.length) return null;

  // On mobile show far fewer labels to avoid crowding
  const interval = isMobile ? Math.floor(data.length / 6) : 11;

  const tickFormatter = (value, index) => (index % interval === 0 ? value : "");

  return (
    <ResponsiveContainer width="100%" height={isMobile ? 380 : 500}>
      <LineChart
        data={data}
        margin={{
          top: 16,
          right: isMobile ? 12 : 40,
          bottom: isMobile ? 60 : 80,
          left: isMobile ? 12 : 60,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
        <XAxis
          dataKey="label"
          tickFormatter={tickFormatter}
          tick={{ fontSize: isMobile ? 10 : 13 }}
          angle={-45}
          textAnchor="end"
          height={isMobile ? 60 : 80}
          interval={0}
        />
        <YAxis
          tick={{ fontSize: isMobile ? 10 : 13 }}
          width={isMobile ? 36 : 60}
          label={
            isMobile
              ? null
              : {
                  value: "Index (2015=100)",
                  angle: -90,
                  position: "insideLeft",
                  offset: -10,
                  style: { fontSize: 13, fill: "#6b7280" },
                }
          }
        />
        <Tooltip
          formatter={(value) => [value.toFixed(2), "CPIH Index"]}
          labelStyle={{ fontWeight: 600 }}
          contentStyle={{ fontSize: 12 }}
        />
        <Line
          type="monotone"
          dataKey="value"
          dot={false}
          strokeWidth={isMobile ? 1.5 : 2.5}
          stroke="#2563eb"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function RangeSlider({ total, range, onChange }) {
  if (!total) return null;
  return (
    <div className={styles.sliderWrapper}>
      <div className={styles.sliderHeader}></div>
      <div className={styles.sliderControls}>
        <div className={styles.sliderRow}>
          <label className={styles.sliderLabel}>
            Start
          </label>
          <input
            type="range"
            min={0}
            max={total - 1}
            value={range[0]}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (val < range[1]) onChange([val, range[1]]);
            }}
            className={styles.sliderInput}
          />
        </div>
        <div className={styles.sliderRow}>
          <label className={styles.sliderLabel}>
            End
          </label>
          <input
            type="range"
            min={0}
            max={total - 1}
            value={range[1]}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (val > range[0]) onChange([range[0], val]);
            }}
            className={styles.sliderInput}
          />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState([0, 0]);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetch(
      `${BASE}/datasets/cpih01/editions/time-series/versions/6/observations` +
        `?time=*&geography=K02000001&aggregate=cpih1dim1A0`,
    )
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        const mapped = (json.observations ?? []).map((obs) => ({
          label: obs.dimensions.Time.label,
          value: parseFloat(obs.observation),
        }));

        // Parse "Mon-YY" into a real date for sorting
        const monthMap = {
          Jan: 0,
          Feb: 1,
          Mar: 2,
          Apr: 3,
          May: 4,
          Jun: 5,
          Jul: 6,
          Aug: 7,
          Sep: 8,
          Oct: 9,
          Nov: 10,
          Dec: 11,
        };

        const parseLabel = (label) => {
          const [mon, yr] = label.split("-");
          const fullYear = parseInt(yr) + (parseInt(yr) < 50 ? 2000 : 1900);
          return new Date(fullYear, monthMap[mon] ?? 0);
        };

        const sorted = mapped.sort(
          (a, b) => parseLabel(a.label) - parseLabel(b.label),
        );

        setAllData(sorted);
        setRange([0, sorted.length - 1]);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const visibleData = useMemo(
    () => allData.slice(range[0], range[1] + 1),
    [allData, range],
  );

  const startLabel = allData[range[0]]?.label ?? "";
  const endLabel = allData[range[1]]?.label ?? "";

  return (
    <div className={styles.appContainer}>
      <Header />

      <main className={styles.mainContent}>
        <h1 className={styles.pageTitle}>
          UK Inflation (CPIH)
        </h1>
        <p className={styles.subtitle}>
          Consumer Prices Index including owner occupiers' housing costs
        </p>
        <p className={styles.shoutout}>
          shoutout joe
        </p>

        {loading && <p>Loading data...</p>}
        {error && <p className={styles.errorText}>Error: {error}</p>}

        {!loading && !error && (
          <>
            <div className={styles.infoBox}>
              <p className={styles.infoTextBold}>
                Date range — showing {visibleData.length} of {allData.length}{" "}
                periods
              </p>
              <p className={styles.infoTextLight}>
                {startLabel} → {endLabel}
              </p>
              <RangeSlider
                total={allData.length}
                range={range}
                onChange={setRange}
              />
            </div>

            <div className={styles.chartContainer}>
              <Chart data={visibleData} isMobile={isMobile} />
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
