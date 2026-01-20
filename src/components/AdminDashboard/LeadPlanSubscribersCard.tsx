import AdminCardShell from "./AdminCardShell";
import { BarChart, Bar, Tooltip, ResponsiveContainer, XAxis } from "recharts";

const leadPlanStats = {
  totalSubscribers: 5000,
  dailyAverage: 20,
  growthPercent: 10,
};

const weeklySubscriptions = [
  { day: "Sun", value: 420 },
  { day: "Mon", value: 310 },
  { day: "Tue", value: 480 },
  { day: "Wed", value: 520 },
  { day: "Thu", value: 360 },
  { day: "Fri", value: 450 },
  { day: "Sat", value: 160 },
];

const LeadPlanSubscribersCard = () => {
  const { totalSubscribers, dailyAverage, growthPercent } = leadPlanStats;
  const isPositive = growthPercent >= 0;

  return (
    <AdminCardShell title="Total Vendors Subscribers" subtitle="Lead plans">
      <div className="flex h-full flex-col gap-6">
        <div className="space-y-2 flex  justify-between">
          <div className="text-3xl font-bold text-slate-900">
            {totalSubscribers.toLocaleString()}
          </div>
          <div className="flex items-center gap-3 text-sm font-semibold">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                isPositive
                  ? "border border-rose-200 bg-rose-50 text-rose-600"
                  : "border border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {isPositive ? "+10%" : "-10%"}
            </span>
            <span className="text-slate-700">20 per day</span>
          </div>
        </div>

        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklySubscriptions}
              margin={{ top: 0, right: 4, left: 4, bottom: 0 }}
              barCategoryGap={12}
            >
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#94a3b8" }}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  padding: "8px 10px",
                  boxShadow: "none",
                  fontSize: 12,
                  color: "#0f172a",
                }}
                labelStyle={{ color: "#0f172a", fontWeight: 600 }}
                itemStyle={{ color: "#0f172a" }}
                formatter={(
                  value: number | string | (number | string)[] | undefined
                ): [string, string] => {
                  const raw = Array.isArray(value) ? value[0] : value;
                  const numeric = Number(raw ?? 0);
                  const display = Number.isFinite(numeric)
                    ? numeric.toLocaleString()
                    : `${raw ?? 0}`;
                  return [`Sales: ${display}`, ""];
                }}
                labelFormatter={(label) => label}
              />
              <Bar
                dataKey="value"
                radius={[10, 10, 10, 10]}
                fill="#d9e5ff"
                barSize={40}
                activeBar={{ fill: "#2563eb" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="text-sm font-semibold text-slate-700">
          Most popular: <span className="text-slate-900">Basic Plan</span>
        </div>
      </div>
    </AdminCardShell>
  );
};

export default LeadPlanSubscribersCard;
