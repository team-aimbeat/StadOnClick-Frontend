import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "1–30 days", value: 4200 },
  { name: "31–60 days", value: 4300 },
  { name: "61–90 days", value: 3400 },
  { name: "91–120 days", value: 3500 },
];

const StatBox = ({ value, label }: { value: string; label: string }) => (
  <div className="border rounded-xl p-4 text-center">
    <div className="text-lg font-bold text-gray-900">{value}</div>
    <div className="text-xs text-gray-500 mt-1">{label}</div>
  </div>
);

const CustomerAcquisitionCard = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">
          Cost to Acquire a Customer
        </h3>
        <span className="text-xs px-3 py-1 border font-semibold rounded-full text-gray-600">
          Last 7 days
        </span>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left Section */}
        <div className="col-span-8">
          {/* Cost */}
          <div className="flex items-end gap-3 mb-4">
            <div className="text-2xl font-bold text-gray-900">$200</div>
            <span className="text-xs px-2 py-1 rounded-full  bg-green-100 text-green-700 font-medium">
              +2% <img className="w-5 h-5 object-contain inline-flex items-center"src="src/assets/images/ArrowRise.png"/>
            </span>
            <span className="text-xs text-gray-500 ml-2">
              per new customer
            </span>
          </div>

          {/* Chart */}
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
                <Bar
                  dataKey="value"
                  radius={[6, 6, 0, 0]}
                  fill="#7FB0FF"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Stats */}
        <div className="col-span-4 space-y-3">
          <StatBox value="67" label="New customers" />
          <StatBox value="$17,200" label="Marketing spend" />
          <StatBox value="67" label="Cost / booking" />
        </div>
      </div>
    </div>
  );
};

export default CustomerAcquisitionCard;
