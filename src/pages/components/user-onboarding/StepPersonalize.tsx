import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  useGetPublicInterestsQuery,
  useGetPublicTimeDurationsQuery,
  type PublicInterest,
  type PublicTimeDuration,
} from "@/features/preferences/api/preferencesApi"
import timeIcon from "@/assets/icons/Time.svg"
import heartLowIcon from "@/assets/icons/heart1.svg"
import heartMidIcon from "@/assets/icons/heart2.svg"
import heartHighIcon from "@/assets/icons/heart3.svg"
import morningIcon from "@/assets/icons/sunrise.svg"
import afternoonIcon from "@/assets/icons/sun.svg"
import eveningIcon from "@/assets/icons/night.svg"

type Props = {
  onNext: () => void
  onSkip: () => void
}

export function StepPersonalize({ onNext, onSkip }: Props) {
  const [selectedTimes, setSelectedTimes] = useState<string[]>([])
  const [selectedEnergy, setSelectedEnergy] = useState<string[]>([])
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [selectedMoments, setSelectedMoments] = useState<string[]>([])
  const {
    data: interestsData,
    isLoading: interestsLoading,
    isError: interestsError,
  } = useGetPublicInterestsQuery()
  const {
    data: timeDurationsData,
    isLoading: timeDurationsLoading,
    isError: timeDurationsError,
  } = useGetPublicTimeDurationsQuery()

  const toggleSelection = (
    value: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
    )
  }

  useEffect(() => {
    if (timeDurationsData?.length) {
      const defaults = timeDurationsData.filter((item) => item.isDefault).map((item) => item.id)
      if (defaults.length) {
        setSelectedTimes((prev) => (prev.length ? prev : defaults))
      }
    }
  }, [timeDurationsData])

  const renderInterestIcon = (interest: PublicInterest) => {
    if (interest.icon) {
      return <span className="text-base leading-none">{interest.icon}</span>
    }
    const color = interest.color || "#3B82F6"
    return <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
  }

  const renderSkeletonPills = (count: number, width = "w-[96px]") =>
    Array.from({ length: count }).map((_, idx) => (
      <div
        key={idx}
        className={`h-[40px] ${width} rounded-[9px] border border-dashed border-slate-200 bg-slate-50 animate-pulse`}
      />
    ))

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-[13px] font-semibold text-[#3B3B3B]">
          How much time do you usually have?
        </p>
        <div className="flex flex-wrap gap-2">
          {timeDurationsLoading
            ? renderSkeletonPills(3)
            : timeDurationsError
              ? <p className="text-xs text-red-600">Unable to load time options.</p>
              : timeDurationsData?.length
                ? timeDurationsData.map((duration: PublicTimeDuration) => (
                    <button
                      key={duration.id}
                      type="button"
                      onClick={() => toggleSelection(duration.id, selectedTimes, setSelectedTimes)}
                      className={`flex h-[40px] w-[96px] items-center justify-center gap-2 rounded-[9px] border text-[12px] shadow-sm ${
                        selectedTimes.includes(duration.id)
                          ? "border-[#3289FF] bg-[#EAF2FF] text-[#1F4FBF]"
                          : "border-[#D1D5DB] bg-white text-[#3B3B3B] hover:border-[#3289FF]"
                      }`}
                    >
                      {duration.icon ? (
                        <span className="text-base leading-none">{duration.icon}</span>
                      ) : (
                        <img src={timeIcon} alt="" className="h-4 w-4" />
                      )}
                      {duration.label}
                    </button>
                  ))
                : <p className="text-xs text-slate-500">No time durations available.</p>}
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
              onClick={() => toggleSelection(label, selectedEnergy, setSelectedEnergy)}
              className={`flex h-[40px] items-center gap-2 rounded-[9px] border px-3 text-[12px] shadow-sm ${
                selectedEnergy.includes(label)
                  ? "border-[#3289FF] bg-[#EAF2FF] text-[#1F4FBF]"
                  : "border-[#D1D5DB] bg-white text-[#3B3B3B] hover:border-[#3289FF]"
              }`}
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
          {interestsLoading
            ? renderSkeletonPills(6, "w-full")
            : interestsError
              ? <p className="col-span-2 text-xs text-red-600">Unable to load interests.</p>
              : interestsData?.length
                ? interestsData.map((interest: PublicInterest) => (
                    <button
                      key={interest.id}
                      type="button"
                      onClick={() => toggleSelection(interest.id, selectedGoals, setSelectedGoals)}
                      className={`flex h-[40px] items-center gap-2 rounded-[9px] border px-3 text-[12px] shadow-sm ${
                        selectedGoals.includes(interest.id)
                          ? "border-[#3289FF] bg-[#EAF2FF] text-[#1F4FBF]"
                          : "border-[#D1D5DB] bg-white text-[#3B3B3B] hover:border-[#3289FF]"
                      }`}
                    >
                      {renderInterestIcon(interest)}
                      {interest.name}
                    </button>
                  ))
                : <p className="col-span-2 text-xs text-slate-500">No interests available right now.</p>}
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
              onClick={() => toggleSelection(label, selectedMoments, setSelectedMoments)}
              className={`flex h-[40px] items-center gap-2 rounded-[9px] border px-3 text-[12px] shadow-sm ${
                selectedMoments.includes(label)
                  ? "border-[#3289FF] bg-[#EAF2FF] text-[#1F4FBF]"
                  : "border-[#D1D5DB] bg-white text-[#3B3B3B] hover:border-[#3289FF]"
              }`}
            >
              <img src={icon} alt="" className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-2  text-[11px] text-[#6B7280]">
        <div className="mt-[1px] flex h-5 w-5 items-center justify-center rounded-full border border-[#D1D5DB] text-[12px] text-[#242426]">
          i
        </div>
        <p className="text-[12px] font-normal">
          Based on your preferences, we&apos;ll show activities that match your time,
          energy, and interests.
        </p>
      </div>

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
