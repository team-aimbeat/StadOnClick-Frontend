import { Button } from "@/components/ui/button"
import timeIcon from "@/assets/icons/Time.svg"
import heartLowIcon from "@/assets/icons/heart1.svg"
import heartMidIcon from "@/assets/icons/heart2.svg"
import heartHighIcon from "@/assets/icons/heart3.svg"
import fitnessIcon from "@/assets/icons/barbell.svg"
import wellnessIcon from "@/assets/icons/plant.svg"
import focusIcon from "@/assets/icons/target.svg"
import learningIcon from "@/assets/icons/book.svg"
import socialIcon from "@/assets/icons/group.svg"
import outdoorIcon from "@/assets/icons/earth.svg"
import morningIcon from "@/assets/icons/sunrise.svg"
import afternoonIcon from "@/assets/icons/sun.svg"
import eveningIcon from "@/assets/icons/night.svg"

type Props = {
  onNext: () => void
  onSkip: () => void
}

export function StepPersonalize({ onNext, onSkip }: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-[13px] font-semibold text-[#3B3B3B]">
          How much time do you usually have?
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "15 min", icon: timeIcon },
            { label: "30 min", icon: timeIcon },
            { label: "1 hr", icon: timeIcon },
          ].map(({ label, icon }) => (
            <button
              key={label}
              type="button"
              className="flex h-[40px] w-[96px] items-center justify-center gap-2 rounded-[9px] border border-[#D1D5DB] bg-white text-[12px] text-[#3B3B3B] shadow-sm hover:border-[#3289FF]"
            >
              <img src={icon} alt="" className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[13px] font-semibold text-[#3B3B3B]">
          How do you usually feel during the day?
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Low energy", icon: heartLowIcon },
            { label: "Medium energy", icon: heartMidIcon },
            { label: "Active & intense", icon: heartHighIcon },
          ].map(({ label, icon }) => (
            <button
              key={label}
              type="button"
              className="flex h-[40px] items-center gap-2 rounded-[9px] border border-[#D1D5DB] bg-white px-3 text-[12px] text-[#3B3B3B] shadow-sm hover:border-[#3289FF]"
            >
              <img src={icon} alt="" className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[13px] font-semibold text-[#3B3B3B]">
          What are you looking for right now?
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Fitness & Movement", icon: fitnessIcon },
            { label: "Wellness & Relaxation", icon: wellnessIcon },
            { label: "Focus & Productivity", icon: focusIcon },
            { label: "Learning & Skill Building", icon: learningIcon },
            { label: "Social & Group Activities", icon: socialIcon },
            { label: "Outdoor Experiences", icon: outdoorIcon },
          ].map(({ label, icon }) => (
            <button
              key={label}
              type="button"
              className="flex h-[40px] items-center gap-2 rounded-[9px] border border-[#D1D5DB] bg-white px-3 text-[12px] text-[#3B3B3B] shadow-sm hover:border-[#3289FF]"
            >
              <img src={icon} alt="" className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[13px] font-semibold text-[#3B3B3B]">
          When do you usually prefer activities?
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Morning", icon: morningIcon },
            { label: "Afternoon", icon: afternoonIcon },
            { label: "Evening", icon: eveningIcon },
          ].map(({ label, icon }) => (
            <button
              key={label}
              type="button"
              className="flex h-[40px] items-center gap-2 rounded-[9px] border border-[#D1D5DB] bg-white px-3 text-[12px] text-[#3B3B3B] shadow-sm hover:border-[#3289FF]"
            >
              <img src={icon} alt="" className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-slate-500">
        Based on your preferences, we’ll show activities that match your time,
        energy, and interests.
      </p>

      <Button
        className="h-[56px] w-full max-w-[487.82px] mx-auto rounded-[10px] bg-[#3B82F6] px-6 text-white"
        onClick={onNext}
      >
        Continue
      </Button>
      <Button
        variant="outline"
        className="h-[56px] w-full max-w-[487.82px] mx-auto rounded-[10px] border-[#3289FF] px-6 text-[#3289FF]"
        onClick={onSkip}
      >
        Skip for now
      </Button>
    </div>
  )
}
