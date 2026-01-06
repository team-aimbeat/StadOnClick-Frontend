import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
} from "recharts";

const data = [
  { day: "Mon", value: 420 },
  { day: "Tue", value: 360 },
  { day: "Wed", value: 480 },
  { day: "Thu", value: 520 },
  { day: "Fri", value: 430 },
  { day: "Sat", value: 380 },
];

const NewSubscriptionsCard = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm h-[250px] w-[350px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-gray-500">
          New subscriptions
        </h3>
        <div className="flex items-center gap-1 text-xs text-green-600">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          New (Paid)
        </div>
      </div>

      {/* KPI */}
      <div className="flex items-end gap-2 mb-2">
        <span className="text-2xl font-bold text-gray-900">1,248</span>
        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
          +4%
        </span>
      </div>

      {/* Chart */}
      <div className="h-[150px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            {/* Dotted vertical reference line (Thu) */}
            <ReferenceLine
              x="Thu"
              stroke="#22c55e"
              strokeDasharray="4 4"
            />

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#6B7280" }}
            />
            <YAxis
              hide
              domain={[200, 600]}
            />

            <Tooltip
              cursor={false}
              contentStyle={{
                fontSize: "12px",
                borderRadius: "8px",
              }}
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ r: 3, fill: "#22c55e" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NewSubscriptionsCard;
