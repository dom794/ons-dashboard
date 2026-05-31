import { useEffect, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const BASE = "https://api.beta.ons.gov.uk/v1";

function Chart({ data }) {
  if (!data.length) return null;

  // Only show every 12th label to avoid crowding
  const tickFormatter = (value, index) => (index % 12 === 0 ? value : "");

  return (
    <ResponsiveContainer width="100%" height={500}>
      <LineChart
        data={data}
        margin={{ top: 16, right: 40, bottom: 80, left: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
        <XAxis
          dataKey="label"
          tickFormatter={tickFormatter}
          tick={{ fontSize: 13 }}
          angle={-45}
          textAnchor="end"
          height={80}
          interval={0}
        />
        <YAxis
          tick={{ fontSize: 13 }}
          width={60}
          label={{
            value: "Index (2015=100)",
            angle: -90,
            position: "insideLeft",
            offset: -10,
            style: { fontSize: 13, fill: "#6b7280" },
          }}
        />
        <Tooltip
          formatter={(value) => [value.toFixed(2), "CPIH Index"]}
          labelStyle={{ fontWeight: 600 }}
        />
        <Line
          type="monotone"
          dataKey="value"
          dot={false}
          strokeWidth={2.5}
          stroke="#2563eb"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function RangeSlider({ total, range, onChange }) {
  if (!total) return null;
  return (
    <div style={{ padding: "1rem 0 0.5rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 13,
          color: "#6b7280",
          marginBottom: 8,
        }}
      >
        <span>
          From: <strong style={{ color: "#111" }}>index {range[0]}</strong>
        </span>
        <span>
          To: <strong style={{ color: "#111" }}>index {range[1]}</strong>
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <label style={{ fontSize: 13, width: 36, color: "#6b7280" }}>
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
            style={{ flex: 1, accentColor: "#2563eb" }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <label style={{ fontSize: 13, width: 36, color: "#6b7280" }}>
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
            style={{ flex: 1, accentColor: "#2563eb" }}
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
    <div
      style={{
        width: "100%",
        boxSizing: "border-box",
        padding: "2rem 3rem",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>
        UK Inflation (CPIH)
      </h1>
      <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 8 }}>
        Consumer Prices Index including owner occupiers' housing costs · Source:
        ONS
      </p>
      <p style={{ color: "red", fontSize: 14, marginBottom: 24 }}>
        shoutout joe
      </p>

      {loading && <p>Loading data...</p>}
      {error && <p style={{ color: "#dc2626" }}>Error: {error}</p>}

      {!loading && !error && (
        <>
          <div
            style={{
              background: "#dbeafe",
              border: "1px solid #bfdbfe",
              borderRadius: 10,
              padding: "0.75rem 1.25rem",
              marginBottom: 24,
              maxWidth: 500,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 2,
                color: "#374151",
              }}
            >
              Date range — showing {visibleData.length} of {allData.length}{" "}
              periods
            </p>
            <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
              {startLabel} → {endLabel}
            </p>
            <RangeSlider
              total={allData.length}
              range={range}
              onChange={setRange}
            />
          </div>

          <div
            style={{
              width: "100%",
              minWidth: 0,
              background: "#dbeafe",
              border: "1px solid #bfdbfe",
              borderRadius: 12,
              padding: "1.5rem 1rem 1rem",
              boxSizing: "border-box",
            }}
          >
            <Chart data={visibleData} />
          </div>
        </>
      )}
    </div>
  );
}
