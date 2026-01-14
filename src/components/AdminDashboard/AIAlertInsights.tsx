import { HiOutlineChevronRight, HiOutlineClock, HiOutlineSparkles } from "react-icons/hi2";

const alertIcons = [
  HiOutlineSparkles,
  HiOutlineSparkles,
  HiOutlineSparkles,
];

const alerts = [
  {
    title: "Meeting with Arthur Taylor",
    description: "Discuss about refactoring code.",
    tags: ["Work", "Meeting"],
    date: "Aug 03",
  },
  {
    title: "Lunch with Alex",
    description: "Sushi Place, Oak Makki Street 12",
    tags: ["Life", "Event"],
    date: "Aug 03",
  },
  {
    title: "Bug Fixing Sprint",
    description: "All-day, focus critical issues.",
    tags: ["Optimization"],
    date: "Aug 03",
  },
];

const AIAlertInsights = () => {
  return (
    <div className="rounded-[32px]  bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">AI alert & Insights</h3>
        <button className="text-xs font-semibold text-slate-500 hover:text-slate-700">View all</button>
      </div>

      <div className="mt-6 space-y-4">
        {alerts.map((alert, index) => {
          const Icon = alertIcons[index % alertIcons.length];
          return (
            <div
              key={alert.title}
              className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-white to-slate-100">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                    <Icon className="h-5 w-5 text-slate-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{alert.title}</p>
                  <p className="text-xs text-slate-500">{alert.description}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-slate-600">{alert.date}</span>
                <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-400">
                  <HiOutlineClock className="h-4 w-4" />
                  <span>08:45 AM</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>See upcoming alerts</span>
        <HiOutlineChevronRight className="h-4 w-4" />
      </div>
    </div>
  );
};

export default AIAlertInsights;
