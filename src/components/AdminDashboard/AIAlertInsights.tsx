import { HiOutlineChevronRight, HiOutlineSparkles } from "react-icons/hi2";

type Insight = {
  title: string;
  description: string;
  timestamp: string;
};

const insights: Insight[] = [
  {
    title: "Refund spike detected",
    description: "North region shows 18% jump in refund requests vs baseline.",
    timestamp: "08:45 AM",
  },
  {
    title: "Vendor SLA at risk",
    description: "Five vendors missed response SLAs; auto-escalation disabled.",
    timestamp: "09:10 AM",
  },
  {
    title: "High-value booking churn",
    description: "Repeat buyers dropping on checkout step 3; monitor payment flow.",
    timestamp: "10:25 AM",
  },
];

const AIAlertInsights = () => {
  return (
    <div className="rounded border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">
          AI Alert &amp; Insights
        </h3>
        <button className="text-xs font-semibold text-slate-600 hover:text-slate-800">
          View all
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {insights.map((alert) => (
          <div
            key={alert.title}
            className="flex items-start justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white">
                <HiOutlineSparkles className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {alert.title}
                </p>
                <p className="text-xs text-slate-600">{alert.description}</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {alert.timestamp}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between text-xs font-semibold text-slate-600">
        <span>Upcoming signals</span>
        <HiOutlineChevronRight className="h-4 w-4" />
      </div>
    </div>
  );
};

export default AIAlertInsights;
