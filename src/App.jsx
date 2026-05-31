import { useEffect, useState } from "react";
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
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart
        data={data}
        margin={{ top: 8, right: 24, bottom: 8, left: 24 }}
      >
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={11} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="value"
          dot={false}
          strokeWidth={2}
          stroke="#2563eb"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setData(mapped);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "2rem",
        fontFamily: "sans-serif",
      }}
    >
      <h1>UK Inflation (CPIH)</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {!loading && !error && <Chart data={data} />}
    </div>
  );
}
