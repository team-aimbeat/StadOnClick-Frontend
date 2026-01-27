import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react"
import { Button } from "@/components/ui/button"
import {
  useGetPublicInterestsQuery,
  useGetPublicTimeDurationsQuery,
  useGetMyPreferencesQuery,
  useSaveMyPreferencesMutation,
  type PublicInterest,
  type PublicTimeDuration,
} from "@/features/preferences/api/preferencesApi"
import { toast } from "react-hot-toast"
import timeIcon from "@/assets/icons/Time.svg"
import heartLowIcon from "@/assets/icons/heart1.svg"
import heartMidIcon from "@/assets/icons/heart2.svg"
import heartHighIcon from "@/assets/icons/heart3.svg"
import morningIcon from "@/assets/icons/sunrise.svg"
import afternoonIcon from "@/assets/icons/sun.svg"
import eveningIcon from "@/assets/icons/night.svg"
import EmojiIcon from "@/components/shared/EmojiIcon"

type Props = {
  onNext: () => void
  onSkip: () => void
  isPreview?: boolean
  hideSaveButton?: boolean
  previewInterests?: PublicInterest[]
  previewTimeDurations?: PublicTimeDuration[]
  previewPreferences?: any
}

export function StepPersonalize({
  onNext,
  onSkip,
  isPreview,
  hideSaveButton,
  previewInterests,
  previewTimeDurations,
  previewPreferences,
}: Props) {
  const previewMode = Boolean(isPreview || previewInterests || previewTimeDurations || previewPreferences)
  const [selectedTimes, setSelectedTimes] = useState<string[]>([])
  const [selectedEnergy, setSelectedEnergy] = useState<string[]>([])
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [selectedMoments, setSelectedMoments] = useState<string[]>([])
  const [savePreferences, { isLoading: savingPreferences }] = useSaveMyPreferencesMutation()
  const {
    data: interestsData,
    isLoading: interestsLoading,
    isError: interestsError,
  } = useGetPublicInterestsQuery(undefined, { skip: Boolean(previewInterests) })
  const {
    data: timeDurationsData,
    isLoading: timeDurationsLoading,
    isError: timeDurationsError,
  } = useGetPublicTimeDurationsQuery(undefined, { skip: Boolean(previewTimeDurations) })

  const { data: myPreferencesData } = useGetMyPreferencesQuery(undefined, { skip: previewMode })
  const effectiveInterests = previewInterests ?? interestsData
  const effectiveDurations = previewTimeDurations ?? timeDurationsData
  const effectivePreferences = previewPreferences ?? myPreferencesData
  const preferencesAppliedRef = useRef(false)

  useEffect(() => {
    if (
      selectedTimes.length ||
      effectivePreferences?.preferredDurationId ||
      !effectiveDurations?.length
    ) {
      return
    }
    if (effectiveDurations?.length) {
      const defaultId = effectiveDurations.find((item) => item.isDefault)?.id
      if (defaultId) {
        setSelectedTimes((prev) => (prev.length ? prev : [defaultId]))
      }
    }
  }, [effectiveDurations, effectivePreferences, selectedTimes])

  useEffect(() => {
    if (!effectivePreferences || preferencesAppliedRef.current) {
      return
    }

    const durationId =
      effectivePreferences.preferredDurationId || effectivePreferences.preferredDuration?.id
    if (durationId) {
      setSelectedTimes([durationId])
    }

    const energyLabelMap: Record<string, string> = {
      LOW: "Low energy",
      MEDIUM: "Medium energy",
      HIGH: "Active & intense",
    }
    if (effectivePreferences.energyLevel) {
      const energyLabel = energyLabelMap[effectivePreferences.energyLevel]
      if (energyLabel) {
        setSelectedEnergy([energyLabel])
      }
    }

    if (Array.isArray(effectivePreferences.interests)) {
      const interestIds = effectivePreferences.interests
        .map((item: any) => item.interestId ?? item.interest?.id)
        .filter(Boolean)
      setSelectedGoals(interestIds)
    }

    const timeLabelMap: Record<string, string> = {
      MORNING: "Morning",
      AFTERNOON: "Afternoon",
      EVENING: "Evening",
    }
    if (Array.isArray(effectivePreferences.preferredTimes)) {
      setSelectedMoments(
        effectivePreferences.preferredTimes
          .map((time: any) => time.timeOfDay || time)
          .map((time: string) => timeLabelMap[time])
          .filter(Boolean),
      )
    }

    preferencesAppliedRef.current = true
  }, [effectivePreferences])

  const renderInterestIcon = (interest: PublicInterest) => {
    if (interest.icon) {
      return <EmojiIcon emoji={interest.icon} size={18} />
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

  const toggleSingle = (value: string, setSelected: Dispatch<SetStateAction<string[]>>) => {
    setSelected((prev) => (prev[0] === value ? [] : [value]))
  }

  const toggleMulti = (value: string, setSelected: Dispatch<SetStateAction<string[]>>) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
    )
  }

  const handleSave = async () => {
    if (!selectedEnergy.length || !selectedTimes.length) {
      toast.error("Select at least one time option and energy level.")
      return
    }

    const energyMap: Record<string, string> = {
      "Low energy": "LOW",
      "Medium energy": "MEDIUM",
      "Active & intense": "HIGH",
    }

    const timeMap: Record<string, string> = {
      Morning: "MORNING",
      Afternoon: "AFTERNOON",
      Evening: "EVENING",
    }

    const payload = {
      energyLevel: energyMap[selectedEnergy[0]] || "MEDIUM",
      preferredDurationId: selectedTimes[0],
      interestIds: selectedGoals,
      preferredTimes: selectedMoments.map((label) => timeMap[label]).filter(Boolean),
    }

    try {
      if (previewMode) {
        toast.success("Preview updated")
        return
      }
      await savePreferences(payload).unwrap()
      toast.success("Preferences saved")
      onNext()
    } catch (err) {
      toast.error("Failed to save preferences")
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-[13px] font-semibold text-[#3B3B3B]">
          How much time do you usually have?
        </p>
        <div className="flex flex-wrap gap-2">
          {timeDurationsLoading && !previewTimeDurations
            ? renderSkeletonPills(3)
            : timeDurationsError
              ? <p className="text-xs text-red-600">Unable to load time options.</p>
              : effectiveDurations?.length
                ? effectiveDurations.map((duration: PublicTimeDuration) => (
                    <button
                      key={duration.id}
                      type="button"
                      onClick={() => toggleSingle(duration.id, setSelectedTimes)}
                      className={`flex h-[40px] w-[96px] items-center justify-center gap-2 rounded-[9px] border-2 text-[12px] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3289FF]/40 ${
                        selectedTimes.includes(duration.id)
                          ? "border-[#3289FF] bg-[#EAF2FF] text-[#1F4FBF]"
                          : "border-[#D1D5DB] bg-white text-[#3B3B3B] hover:border-[#3289FF]"
                      }`}
                    >
                      {duration.icon ? (
                        <EmojiIcon emoji={duration.icon} size={18} />
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
                onClick={() => toggleSingle(label, setSelectedEnergy)}
                className={`flex h-[40px] items-center gap-2 rounded-[9px] border-2 px-3 text-[12px] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3289FF]/40 ${
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
          {interestsLoading && !previewInterests
            ? renderSkeletonPills(6, "w-full")
            : interestsError
              ? <p className="col-span-2 text-xs text-red-600">Unable to load interests.</p>
              : effectiveInterests?.length
                ? effectiveInterests.map((interest: PublicInterest) => (
                    <button
                      key={interest.id}
                      type="button"
                      onClick={() => toggleMulti(interest.id, setSelectedGoals)}
                      className={`flex h-[40px] items-center gap-2 rounded-[9px] border-2 px-3 text-[12px] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3289FF]/40 ${
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
                onClick={() => toggleMulti(label, setSelectedMoments)}
                className={`flex h-[40px] items-center gap-2 rounded-[9px] border-2 px-3 text-[12px] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3289FF]/40 ${
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

<div className="">
      {!hideSaveButton ? (
        <Button
          className="h-[56px] w-full max-w-[487.82px] mx-auto rounded-[10px] bg-[#3B82F6] px-6 text-white"
          onClick={handleSave}
          disabled={savingPreferences || previewMode}
        >
          {previewMode ? "Preview only" : savingPreferences ? "Saving..." : "Save Preferences"}
        </Button>
      ) : null}
</div>
     
    </div>
  )
}
