import {
  HiChevronLeft,
  HiChevronRight,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineCalendarDays,
  HiOutlineClock,
} from "react-icons/hi2";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const calendarDates = [
  { date: "01" },
  { date: "02" },
  { date: "03" },
  { date: "04" },
  { date: "05" },
  { date: "06", selected: true },
  { date: "07" },
  { date: "08" },
  { date: "09" },
  { date: "10" },
  { date: "11" },
  { date: "12" },
  { date: "13" },
  { date: "14" },
  { date: "15" },
  { date: "16" },
  { date: "17" },
  { date: "18" },
  { date: "19" },
  { date: "20" },
  { date: "21" },
  { date: "22" },
  { date: "23" },
  { date: "24" },
  { date: "25" },
  { date: "26" },
  { date: "27" },
  { date: "28" },
  { date: "29" },
  { date: "30" },
  { date: "31" },
];

const meetings = [
  {
    id: 1,
    title: "Meeting",
    host: "By Mehran Malekpour",
    time: "06:00 - 07:30",
  },
  {
    id: 2,
    title: "Meeting",
    host: "By Mehran Malekpour",
    time: "06:00 - 07:30",
  },
  {
    id: 3,
    title: "Meeting",
    host: "By Lynn Chang",
    time: "07:30 - 09:00",
  },
];

const CalendarAgendaCard = () => {
  return (
    <div className="rounded-[28px]  bg-white p-6 ">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
            March 2023
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/60 p-1 shadow-inner">
          <button className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100">
            <HiChevronLeft size={16} />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100">
            <HiChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-slate-500">
        {weekdays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-xs text-slate-600">
        {calendarDates.map((date) => (
          <div
            key={date.date}
            className={`flex h-8 items-center justify-center rounded-2xl transition ${
              date.selected
                ? "bg-blue-700 text-white shadow-lg"
                : "bg-white text-slate-500 hover:bg-slate-100"
            }`}
          >
            {date.date}
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
        <span>Last date for 6 Feb</span>
        <button className="rounded-full border border-slate-200 px-2 py-1 text-[10px] text-slate-500 hover:border-slate-300">
          <HiOutlineAdjustmentsHorizontal size={14} />
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {meetings.map((meeting) => (
          <div
            key={meeting.id}
            className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/70 px-3 py-2 shadow-sm"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-500">
              <HiOutlineCalendarDays size={20} />
            </div>
            <div className="flex-1 space-y-0.5 text-sm">
              <p className="font-semibold text-slate-900">{meeting.title}</p>
              <p className="text-xs text-slate-500">{meeting.host}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <HiOutlineClock size={14} />
              <span>{meeting.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarAgendaCard;
