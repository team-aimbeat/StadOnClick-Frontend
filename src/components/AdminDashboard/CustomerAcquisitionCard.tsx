import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";

const data = [
  { name: "1-30 days", value: 4200 },
  { name: "31-60 days", value: 4300 },
  { name: "61-90 days", value: 3400 },
  { name: "91-120 days", value: 3500 },
];

const StatBox = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-1 flex-col rounded-lg border border-slate-200 bg-slate-50/50 p-4">
    <div className="text-lg font-semibold text-slate-900">{value}</div>
    <div className="mt-1 text-xs text-slate-500">{label}</div>
  </div>
);

const CustomerAcquisitionCard = () => {
  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Cost to Acquire a Customer
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Weekly view of acquisition efficiency
          </p>
        </div>
        <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
          Last 7 days
        </span>
      </div>

      <div className="grid flex-1 grid-cols-12 gap-4">
        <div className="col-span-8 flex flex-col">
          <div className="mb-3 flex items-baseline gap-3">
            <div className="text-2xl font-semibold text-slate-900">$200</div>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
              +2%
              <span className="text-[10px] font-semibold text-emerald-600">
                vs prior
              </span>
            </span>
            <span className="text-xs text-slate-500">per new customer</span>
          </div>

          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barCategoryGap={12}>
                <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid #E5E7EB",
                    fontSize: 12,
                  }}
                  formatter={(value?: number) => [
                    `$${(value ?? 0).toLocaleString()}`,
                    "Spend",
                  ]}
                  labelStyle={{ fontWeight: 600 }}
                  cursor={{ fill: "rgba(79, 70, 229, 0.04)" }}
                />
                <Bar dataKey="value" barSize={26} radius={[8, 8, 0, 0]} fill="#7FB0FF" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-4 flex flex-col gap-3">
          <StatBox value="67" label="New customers" />
          <StatBox value="$17,200" label="Marketing spend" />
          <StatBox value="$31" label="Cost / booking" />
        </div>
      </div>
    </div>
  );
};

export default CustomerAcquisitionCard;
