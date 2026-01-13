import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
  CartesianGrid,
} from "recharts";

const data = [
  { month: "Jan", purchase: 330, returns: 90 },
  { month: "Feb", purchase: 380, returns: 110 },
  { month: "Mar", purchase: 410, returns: 90 },
  { month: "Apr", purchase: 450, returns: 130 },
  { month: "May", purchase: 430, returns: 120 },
];

const NewSubscriptionsCard = () => {
  return (
    <div className="bg-white rounded-3xl  p-5  h-100 max-w-[380px]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
            New Subscriptions
          </p>
          <p className="text-3xl font-bold text-gray-900 leading-tight">1,248</p>
        </div>
        <button className="text-xs font-semibold text-slate-500 hover:text-slate-700">
          View Report
        </button>
      </div>

      <div className="mt-1 flex items-center gap-3">
        <span className="text-xs text-gray-500">Purchase Ratio</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-600">
          +4%
        </span>
      </div>

      <div className="mt-3 flex items-center gap-5 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Purchase</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full border border-current bg-white shadow-inner" />
          <span>Returns</span>
        </div>
      </div>

      <div className="mt-4 h-[170px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 0, right: 0, left: -10, bottom: -10 }}>
            <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" vertical={false} />
            <ReferenceLine
              x="Apr"
              stroke="#22c55e"
              strokeDasharray="4 4"
              strokeOpacity={0.4}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#6B7280" }}
            />
            <YAxis hide domain={[0, 520]} />
            <Tooltip
              cursor={false}
              contentStyle={{
                fontSize: "12px",
                borderRadius: "8px",
                padding: "6px 8px",
              }}
            />
            <Line
              type="monotone"
              dataKey="purchase"
              stroke="#22c55e"
              strokeWidth={3}
              dot={{ r: 3, fill: "#22c55e" }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="returns"
              stroke="#f43f5e"
              strokeWidth={2}
              strokeDasharray="4 3"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NewSubscriptionsCard;
