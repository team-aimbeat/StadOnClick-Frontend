import {
  HiOutlineSparkles,
  HiOutlineExclamationTriangle,
  HiOutlineArrowTrendingDown,
  HiOutlineBolt,
} from "react-icons/hi2";

type Insight = {
  title: string;
  description: string;
  timestamp: string;
  action: string;
  tone: "rose" | "amber" | "indigo";
  icon: React.ComponentType<{ className?: string }>;
};

const insights: Insight[] = [
  {
    title: "Refund spike detected",
    description: "North region shows 18% jump in refund requests vs baseline.",
    timestamp: "08:45 AM",
    action: "Review Details",
    tone: "rose",
    icon: HiOutlineExclamationTriangle,
  },
  {
    title: "Vendor SLA at risk",
    description: "Five vendors missed response SLAs; auto-escalation disabled.",
    timestamp: "09:10 AM",
    action: "Action Required",
    tone: "amber",
    icon: HiOutlineBolt,
  },
  {
    title: "High-value booking churn",
    description: "Repeat buyers dropping on checkout step 3; monitor payment flow.",
    timestamp: "10:25 AM",
    action: "View Funnel",
    tone: "indigo",
    icon: HiOutlineArrowTrendingDown,
  },
];

const AIAlertInsights = () => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef3ff] text-[#3554e0]">
          <HiOutlineSparkles className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            AI Alert &amp; Insights
          </h3>
          <p className="text-sm text-slate-500">
            Real-time anomaly detection and performance signals.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {insights.map((alert) => (
          <div
            key={alert.title}
            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4"
          >
            <div className="flex min-w-0 items-center gap-4">
              <div
                className={
                  "flex h-12 w-12 items-center justify-center rounded-full " +
                  (alert.tone === "rose"
                    ? "bg-rose-100 text-rose-600"
                    : alert.tone === "amber"
                      ? "bg-amber-100 text-amber-600"
                      : "bg-indigo-100 text-indigo-600")
                }
              >
                <alert.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  {alert.title}
                </p>
                <p className="text-sm text-slate-500">{alert.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-6 pl-4">
              <span className="text-xs font-semibold text-slate-500">
                {alert.timestamp}
              </span>
              <button className="text-sm font-semibold text-[#3554e0] hover:text-[#2740b8]">
                {alert.action}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIAlertInsights;
