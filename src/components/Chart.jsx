import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Chart({ data, unit }) {
  if (!data.length) return null;

  // Sample the x-axis labels — show every 12th to avoid crowding
  const tickFormatter = (value, index) => (index % 12 === 0 ? value : "");

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart
        data={data}
        margin={{ top: 8, right: 16, bottom: 8, left: 16 }}
      >
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
        <XAxis
          dataKey="label"
          tickFormatter={tickFormatter}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          label={{
            value: unit,
            angle: -90,
            position: "insideLeft",
            fontSize: 11,
          }}
        />
        <Tooltip formatter={(value) => [value, unit]} />
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
