import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

const data = [
  { name: "1-30 days", value: 4200 },
  { name: "31-60 days", value: 4300 },
  { name: "61-90 days", value: 3400 },
  { name: "91-120 days", value: 3500 },
];

const StatBox = ({ value, label }: { value: string; label: string }) => (
  <div className="rounded-xl border border-slate-200 p-4 text-center">
    <div className="text-lg font-bold text-slate-900">{value}</div>
    <div className="mt-1 text-xs text-slate-500">{label}</div>
  </div>
);

const CustomerAcquisitionCard = () => {
  return (
    <div className="rounded border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">
          Cost to Acquire a Customer
        </h3>
        <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
          Last 7 days
        </span>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8">
          <div className="mb-4 flex items-end gap-3">
            <div className="text-2xl font-bold text-slate-900">$200</div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
              +2%
              <span className="text-[10px] font-semibold text-emerald-600">
                vs prior
              </span>
            </span>
            <span className="ml-2 text-xs text-slate-500">per new customer</span>
          </div>

          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barCategoryGap={10}>
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
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#7FB0FF" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-4 space-y-3">
          <StatBox value="67" label="New customers" />
          <StatBox value="$17,200" label="Marketing spend" />
          <StatBox value="$31" label="Cost / booking" />
        </div>
      </div>
    </div>
  );
};

export default CustomerAcquisitionCard;
