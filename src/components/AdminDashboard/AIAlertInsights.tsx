import {
  HiExclamationCircle,
  HiArrowTrendingUp,
  HiExclamationTriangle,
} from "react-icons/hi2";

type AlertProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  tags: { label: string; color: string }[];
  accent: string;
};

const AlertItem = ({
  icon,
  title,
  description,
  time,
  tags,
  accent,
}: AlertProps) => {
  return (
    <div className="relative bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      {/* Accent bar */}
      <div
        className={`absolute left-0 top-0 h-full w-1 rounded-l-xl ${accent}`}
      />

      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          {/* Icon */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${accent} text-white`}
          >
            {icon}
          </div>

          {/* Content */}
          <div>
            <div className="text-sm font-semibold text-gray-900">
              {title}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {description}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className={`px-3 py-1 rounded-lg text-xs font-medium ${tag.color}`}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Time */}
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {time}
        </span>
      </div>
    </div>
  );
};

const AIAlertInsights = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900">
          AI alert & Insights
        </h3>
        <p className="text-sm text-gray-500 italic mt-1">
          Live anomalies & opportunities
        </p>
      </div>

      {/* Alerts */}
      <div className="space-y-4">
        <AlertItem
          icon={<HiExclamationCircle className="w-5 h-5" />}
          title="Bookings down 30% today"
          description="Drop vs 7-day avg. Mainly Stockholm • Fitness."
          time="2m ago"
          accent="bg-red-500"
          tags={[
            { label: "-30%", color: "bg-red-100 text-red-700" },
            { label: "Stockholm", color: "bg-gray-100 text-gray-700" },
            { label: "Today", color: "bg-gray-100 text-gray-700" },
          ]}
        />

        <AlertItem
          icon={<HiArrowTrendingUp className="w-5 h-5" />}
          title="Lead volume projected +15%"
          description="Expected surge over next 7 days."
          time="2m ago"
          accent="bg-green-500"
          tags={[
            { label: "+15%", color: "bg-green-100 text-green-700" },
            { label: "Stockholm", color: "bg-green-100 text-green-700" },
            { label: "Next 7 days", color: "bg-green-100 text-green-700" },
          ]}
        />

        <AlertItem
          icon={<HiExclamationTriangle className="w-5 h-5" />}
          title="Vendor response time increased"
          description="Median response +18m since morning peak."
          time="2m ago"
          accent="bg-yellow-500"
          tags={[
            { label: "+18m", color: "bg-yellow-100 text-yellow-700" },
            { label: "Stockholm", color: "bg-yellow-100 text-yellow-700" },
            { label: "Today", color: "bg-yellow-100 text-yellow-700" },
          ]}
        />
      </div>
    </div>
  );
};

export default AIAlertInsights;
