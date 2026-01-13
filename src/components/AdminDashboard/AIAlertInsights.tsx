import { HiOutlineChevronRight } from "react-icons/hi2";

const alerts = [
  {
    title: "Meeting with Arthur Taylor",
    description: "Discuss about refactoring code.",
    tags: ["Work", "Meeting"],
    tagColor: "bg-amber-100 text-amber-600",
    date: "Aug 03",
    active: true,
  },
  {
    title: "Lunch with Alex",
    description: "Sushi Place, Oak Makki Street 12",
    tags: ["Life", "Event"],
    tagColor: "bg-rose-100 text-rose-600",
    date: "Aug 03",
  },
  {
    title: "Bug Fixing Sprint",
    description: "All-day, focus critical issues.",
    tags: ["Optimization"],
    tagColor: "bg-sky-100 text-sky-600",
    date: "Aug 03",
  },
];

const AIAlertInsights = () => {
  return (
    <div className="rounded-[30px]  bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">AI alert & Insights</h3>
        <button className="text-xs font-semibold text-slate-500">View all</button>
      </div>
      <div className="mt-6 space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.title}
            className={`flex items-center justify-between rounded-2xl  px-4 py-3 ${
              alert.active ? "bg-slate-50" : "bg-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`h-3 w-3 rounded-full ${
                  alert.active ? "bg-blue-500" : "bg-slate-300"
                }`}
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">{alert.title}</p>
                <p className="text-xs text-slate-500">{alert.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-1">
                {alert.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span className="text-[11px] text-slate-400">{alert.date}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>See upcoming alerts</span>
        <HiOutlineChevronRight className="h-4 w-4" />
      </div>
    </div>
  );
};

export default AIAlertInsights;
