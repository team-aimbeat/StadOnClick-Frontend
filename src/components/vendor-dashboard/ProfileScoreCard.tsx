import { NavLink } from "react-router-dom";
import { HiOutlineArrowRight } from "react-icons/hi2";

type ProfileScoreCardProps = {
  score: number;
  missingTasks: string[];
  supportingText: string;
  ctaLabel: string;
  ctaTo: string;
  variant?: "full" | "compact";
};

const ScoreRing = ({ score }: { score: number }) => {
  const clamped = Math.min(Math.max(score, 0), 100);
  const size = 88;
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative h-20 w-20">
      <svg
        className="-rotate-90 transform"
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth="8"
          className="fill-none stroke-slate-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth="8"
          strokeLinecap="round"
          className="fill-none stroke-emerald-600 transition-all duration-500"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="text-lg font-bold text-emerald-700">{clamped}%</span>
      </div>
    </div>
  );
};

export default function ProfileScoreCard({
  score,
  supportingText,
  ctaLabel,
  ctaTo,
  variant = "full",
}: ProfileScoreCardProps) {
  const headline = "Increase Business Profile Score";
  const subtext = supportingText || "Reach out to more customers";

  const cardClasses =
    variant === "compact"
      ? "flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3"
      : "flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 md:flex-nowrap";

  return (
    <div className={cardClasses}>
      <div className="flex items-center gap-4">
        <ScoreRing score={score} />
        <div className="space-y-0.5">
          <p className="text-base font-bold text-blue-700">{headline}</p>
          <p className="text-sm text-slate-700">{subtext}</p>
        </div>
      </div>
      <NavLink
        to={ctaTo}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-blue-500"
      >
        {ctaLabel}
        <HiOutlineArrowRight className="h-4 w-4" aria-hidden />
      </NavLink>
    </div>
  );
}
