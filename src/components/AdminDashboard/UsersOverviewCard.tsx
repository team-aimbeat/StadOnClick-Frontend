import AdminCardShell from "./AdminCardShell";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const userOverviewData = [
  { name: "New", value: 500, color: "#2563EB" },
  { name: "Subscribed", value: 300, color: "#F59E0B" },
];

const UsersOverviewCard = () => {
  return (
    <AdminCardShell title="Users Overview" subtitle="Monthly snapshot">
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Monthly
          </span>
          <div className="rounded border border-slate-200 px-3 py-1 text-xs text-slate-600">
            Monthly
          </div>
        </div>

        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={userOverviewData}
                dataKey="value"
                nameKey="name"
                innerRadius="60%"
                outerRadius="80%"
                paddingAngle={2}
              >
                {userOverviewData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
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
                formatter={(value: number | string | undefined): [string, string] => {
                  const display = value === undefined ? "0" : value.toString();
                  return [`${display} users`, ""];
                }}
                labelFormatter={(label) => label}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-start gap-6 text-sm font-semibold text-slate-800">
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#2563EB]" />
            New: <span className="font-bold">500</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#F59E0B]" />
            Subscribed: <span className="font-bold">300</span>
          </span>
        </div>
      </div>
    </AdminCardShell>
  );
};

export default UsersOverviewCard;
