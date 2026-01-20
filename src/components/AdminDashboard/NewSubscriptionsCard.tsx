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
    <div className="rounded border border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            New Subscriptions
          </p>
          <p className="text-3xl font-bold text-slate-900">1,248</p>
        </div>
        <button className="text-xs font-semibold text-slate-600 hover:text-slate-800">
          View report
        </button>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <span className="text-xs text-slate-500">Purchase ratio</span>
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-700">
          +4%
          <span className="text-[10px] font-semibold text-emerald-600">
            vs last week
          </span>
        </span>
      </div>

      <div className="mt-4 h-[190px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid
              stroke="#E5E7EB"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#6B7280" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#6B7280" }}
            />
            <Tooltip
              cursor={{ stroke: "#CBD5F5", strokeWidth: 2 }}
              contentStyle={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: "8px 10px",
                fontSize: 12,
                boxShadow: "none",
              }}
            />
            <ReferenceLine y={0} stroke="#E5E7EB" />
            <Line
              type="monotone"
              dataKey="purchase"
              stroke="#2563EB"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="returns"
              stroke="#F97316"
              strokeWidth={2.5}
              strokeDasharray="4 2"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NewSubscriptionsCard;
