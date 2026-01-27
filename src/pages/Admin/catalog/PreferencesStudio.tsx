import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import EmojiPicker, { EmojiStyle } from "emoji-picker-react";

import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { StepPersonalize } from "@/components/shared/user-onboarding/StepPersonalize";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import EmojiIcon from "@/components/shared/EmojiIcon";
import {
  useAdminCreateInterestMutation,
  useAdminCreateTimeDurationMutation,
  useAdminDeleteInterestMutation,
  useAdminUpdateInterestMutation,
  useAdminUpdateTimeDurationMutation,
  useGetPublicInterestsQuery,
  useGetPublicTimeDurationsQuery,
  type PublicInterest,
  type PublicTimeDuration,
} from "@/features/preferences/api/preferencesApi";

const emojiOptions = ["⚡", "🌿", "🧘", "💪", "🎯", "☀️", "🌙", "✨", "❤️", "🔥"];
const durationEmojiOptions = ["⏱️", "⏳", "🕒", "🕘", "🧩", "🌅", "🌙", "✨", "⚡", "🧘"];
const colorOptions = ["#3B82F6", "#F97316", "#10B981", "#E11D48", "#8B5CF6", "#0EA5E9", "#F59E0B"];

const emptyInterestDraft = {
  id: "",
  name: "",
  icon: "",
  color: "#3B82F6",
  sortOrder: "",
  mlTags: "",
};

const emptyDurationDraft = {
  id: "",
  label: "",
  minutes: "",
  icon: "",
  isDefault: false,
  sortOrder: "",
  mlTags: "",
};

export default function PreferencesStudio() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const interestsRef = useRef<HTMLDivElement | null>(null);
  const durationsRef = useRef<HTMLDivElement | null>(null);

  const activeSection = tab === "time-durations" ? "durations" : "interests";

  const {
    data: interestsData = [],
    isLoading: interestsLoading,
  } = useGetPublicInterestsQuery();
  const {
    data: durationsData = [],
    isLoading: durationsLoading,
  } = useGetPublicTimeDurationsQuery();

  const [interestDraft, setInterestDraft] = useState({ ...emptyInterestDraft });
  const [durationDraft, setDurationDraft] = useState({ ...emptyDurationDraft });

  const [createInterest, { isLoading: creatingInterest }] = useAdminCreateInterestMutation();
  const [updateInterest, { isLoading: updatingInterest }] = useAdminUpdateInterestMutation();
  const [deleteInterest, { isLoading: deletingInterest }] = useAdminDeleteInterestMutation();

  const [createDuration, { isLoading: creatingDuration }] = useAdminCreateTimeDurationMutation();
  const [updateDuration, { isLoading: updatingDuration }] = useAdminUpdateTimeDurationMutation();

  const isEditingInterest = Boolean(interestDraft.id);
  const isEditingDuration = Boolean(durationDraft.id);

  const handleJump = (section: "interests" | "durations") => {
    if (section === "interests") {
      navigate("/admin/catalog/interests");
      interestsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate("/admin/catalog/time-durations");
      durationsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const previewInterests = useMemo<PublicInterest[]>(() => {
    const base = interestsData ?? [];
    const hasDraft = Boolean(interestDraft.name || interestDraft.icon || interestDraft.color);
    if (!hasDraft) return base;

    const draftPayload = {
      name: interestDraft.name || "New interest",
      icon: interestDraft.icon || null,
      color: interestDraft.color || null,
    };

    if (interestDraft.id) {
      return base.map((item) => (item.id === interestDraft.id ? { ...item, ...draftPayload } : item));
    }

    if (!interestDraft.name.trim()) return base;
    return [...base, { id: "preview-interest", ...draftPayload }];
  }, [interestDraft, interestsData]);

  const previewDurations = useMemo<PublicTimeDuration[]>(() => {
    const base = durationsData ?? [];
    const hasDraft = Boolean(durationDraft.label || durationDraft.minutes || durationDraft.icon);
    const draftMinutes = Number(durationDraft.minutes || 0);
    const draftPayload = {
      label: durationDraft.label || "New duration",
      minutes: draftMinutes || 0,
      icon: durationDraft.icon || null,
      isDefault: durationDraft.isDefault,
    };

    const withDefaultReset = base.map((item) => {
      if (durationDraft.isDefault && item.id !== durationDraft.id) {
        return { ...item, isDefault: false };
      }
      return item;
    });

    if (!hasDraft) return withDefaultReset;

    if (durationDraft.id) {
      return withDefaultReset.map((item) => (item.id === durationDraft.id ? { ...item, ...draftPayload } : item));
    }

    if (!durationDraft.label.trim() || !draftMinutes) return withDefaultReset;
    return [...withDefaultReset, { id: "preview-duration", ...draftPayload }];
  }, [durationDraft, durationsData]);

  const handleEditInterest = (interest: PublicInterest) => {
    setInterestDraft({
      id: interest.id,
      name: interest.name,
      icon: interest.icon ?? "",
      color: interest.color ?? "#3B82F6",
      sortOrder: "",
      mlTags: "",
    });
  };

  const handleSaveInterest = async () => {
    if (!interestDraft.name.trim()) {
      toast.error("Interest name is required.");
      return;
    }

    const payload = {
      name: interestDraft.name.trim(),
      icon: interestDraft.icon || undefined,
      color: interestDraft.color || undefined,
      sortOrder: interestDraft.sortOrder ? Number(interestDraft.sortOrder) : undefined,
      mlTags: interestDraft.mlTags
        ? interestDraft.mlTags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : undefined,
    };

    try {
      if (isEditingInterest) {
        await updateInterest({ id: interestDraft.id, data: payload }).unwrap();
        toast.success("Interest updated");
      } else {
        await createInterest(payload).unwrap();
        toast.success("Interest created");
      }
      setInterestDraft({ ...emptyInterestDraft });
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to save interest");
    }
  };

  const handleDeleteInterest = async (interestId: string) => {
    if (!window.confirm("Delete this interest?") ) return;
    try {
      await deleteInterest(interestId).unwrap();
      if (interestDraft.id === interestId) {
        setInterestDraft({ ...emptyInterestDraft });
      }
      toast.success("Interest deleted");
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to delete interest");
    }
  };

  const handleEditDuration = (duration: PublicTimeDuration) => {
    setDurationDraft({
      id: duration.id,
      label: duration.label,
      minutes: String(duration.minutes ?? ""),
      icon: duration.icon ?? "",
      isDefault: Boolean(duration.isDefault),
      sortOrder: "",
      mlTags: "",
    });
  };

  const handleSaveDuration = async () => {
    if (!durationDraft.label.trim() || !durationDraft.minutes) {
      toast.error("Duration label and minutes are required.");
      return;
    }

    const payload = {
      label: durationDraft.label.trim(),
      minutes: Number(durationDraft.minutes),
      icon: durationDraft.icon || undefined,
      isDefault: durationDraft.isDefault,
      sortOrder: durationDraft.sortOrder ? Number(durationDraft.sortOrder) : undefined,
      mlTags: durationDraft.mlTags
        ? durationDraft.mlTags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : undefined,
    };

    try {
      if (durationDraft.isDefault) {
        const existingDefault = durationsData.find((item) => item.isDefault && item.id !== durationDraft.id);
        if (existingDefault) {
          await updateDuration({ id: existingDefault.id, data: { isDefault: false } }).unwrap();
        }
      }

      if (isEditingDuration) {
        await updateDuration({ id: durationDraft.id, data: payload }).unwrap();
        toast.success("Duration updated");
      } else {
        await createDuration(payload).unwrap();
        toast.success("Duration created");
      }
      setDurationDraft({ ...emptyDurationDraft });
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to save duration");
    }
  };

  return (
    <div className="space-y-6">
      <TitleBreadCrumbs title="Preference Studio" breadCrumbTitle="Admin / Catalog / Preferences" />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-slate-900">Live preference builder</p>
          <p className="text-xs text-slate-500">Edit interests and durations with a live onboarding preview.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeSection === "interests" ? "default" : "outline"}
            size="sm"
            onClick={() => handleJump("interests")}
          >
            Interests
          </Button>
          <Button
            variant={activeSection === "durations" ? "default" : "outline"}
            size="sm"
            onClick={() => handleJump("durations")}
          >
            Time durations
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div ref={interestsRef}>
            <Card className={cn("border border-slate-200/80 shadow-sm", activeSection === "interests" && "ring-1 ring-blue-200")}>
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Interests</p>
                  <CardTitle className="text-lg text-slate-900">Interest catalog</CardTitle>
                </div>
                <Badge variant="outline" className="rounded-full border-slate-200 text-[11px]">{interestsData.length} items</Badge>
              </div>
              <p className="text-xs text-slate-500">These show up in the user personalization step.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {interestsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((key) => (
                    <Skeleton key={key} className="h-12 w-full" />
                  ))}
                </div>
              ) : interestsData.length ? (
                <div className="space-y-2">
                  {interestsData.map((interest) => (
                    <div key={interest.id} className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white px-3 py-2">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm">
                          {interest.icon ? (
                            <EmojiIcon emoji={interest.icon} size={18} />
                          ) : (
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: interest.color || "#3B82F6" }} />
                          )}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{interest.name}</p>
                          <p className="text-xs text-slate-500">{interest.icon ? "Emoji icon" : "Color dot"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditInterest(interest)}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteInterest(interest.id)} disabled={deletingInterest}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No interests found.</p>
              )}

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">{isEditingInterest ? "Edit interest" : "Create interest"}</p>
                  <Button variant="ghost" size="sm" onClick={() => setInterestDraft({ ...emptyInterestDraft })}>
                    Reset
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Name</Label>
                    <Input
                      value={interestDraft.name}
                      onChange={(event) => setInterestDraft((prev) => ({ ...prev, name: event.target.value }))}
                      placeholder="Yoga, Wellness, ..."
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Emoji / Icon</Label>
                    <EmojiField
                      value={interestDraft.icon}
                      onChange={(value) => setInterestDraft((prev) => ({ ...prev, icon: value }))}
                      options={emojiOptions}
                      placeholder="Emoji"
                      fallbackEmoji="✨"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Color accent</Label>
                    <div className="flex flex-wrap items-center gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setInterestDraft((prev) => ({ ...prev, color }))}
                          className={cn(
                            "h-7 w-7 rounded-full border",
                            interestDraft.color === color ? "border-slate-900" : "border-slate-200"
                          )}
                          style={{ backgroundColor: color }}
                          aria-label={`Set color ${color}`}
                        />
                      ))}
                      <Input
                        value={interestDraft.color}
                        onChange={(event) => setInterestDraft((prev) => ({ ...prev, color: event.target.value }))}
                        className="h-8 w-[120px] text-xs"
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>Sort order (optional)</Label>
                    <Input
                      value={interestDraft.sortOrder}
                      onChange={(event) => setInterestDraft((prev) => ({ ...prev, sortOrder: event.target.value }))}
                      placeholder="0"
                      type="number"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <Label>ML tags (comma separated)</Label>
                    <Input
                      value={interestDraft.mlTags}
                      onChange={(event) => setInterestDraft((prev) => ({ ...prev, mlTags: event.target.value }))}
                      placeholder="relax, calm, stretch"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={handleSaveInterest} disabled={creatingInterest || updatingInterest}>
                    {isEditingInterest ? "Save changes" : "Create interest"}
                  </Button>
                  <span className="text-xs text-slate-500">Preview updates instantly on the right.</span>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>

          <div ref={durationsRef}>
            <Card className={cn("border border-slate-200/80 shadow-sm", activeSection === "durations" && "ring-1 ring-blue-200")}>
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Time durations</p>
                  <CardTitle className="text-lg text-slate-900">Duration catalog</CardTitle>
                </div>
                <Badge variant="outline" className="rounded-full border-slate-200 text-[11px]">{durationsData.length} items</Badge>
              </div>
              <p className="text-xs text-slate-500">Controls the time options in personalization.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {durationsLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((key) => (
                    <Skeleton key={key} className="h-12 w-full" />
                  ))}
                </div>
              ) : durationsData.length ? (
                <div className="space-y-2">
                  {durationsData.map((duration) => (
                    <div key={duration.id} className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white px-3 py-2">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm">
                          <EmojiIcon emoji={duration.icon || "⏱️"} size={18} />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{duration.label}</p>
                          <p className="text-xs text-slate-500">{duration.minutes} mins</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {duration.isDefault ? (
                          <Badge className="rounded-full bg-blue-600 text-[10px] text-white">Default</Badge>
                        ) : null}
                        <Button variant="outline" size="sm" onClick={() => handleEditDuration(duration)}>
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No durations found.</p>
              )}

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">{isEditingDuration ? "Edit duration" : "Create duration"}</p>
                  <Button variant="ghost" size="sm" onClick={() => setDurationDraft({ ...emptyDurationDraft })}>
                    Reset
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Label</Label>
                    <Input
                      value={durationDraft.label}
                      onChange={(event) => setDurationDraft((prev) => ({ ...prev, label: event.target.value }))}
                      placeholder="30 min"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Minutes</Label>
                    <Input
                      value={durationDraft.minutes}
                      onChange={(event) => setDurationDraft((prev) => ({ ...prev, minutes: event.target.value }))}
                      placeholder="30"
                      type="number"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Emoji / Icon</Label>
                    <EmojiField
                      value={durationDraft.icon}
                      onChange={(value) => setDurationDraft((prev) => ({ ...prev, icon: value }))}
                      options={durationEmojiOptions}
                      placeholder="Emoji"
                      fallbackEmoji="⏱️"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Default</Label>
                    <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2">
                      <Switch
                        checked={durationDraft.isDefault}
                        onCheckedChange={(checked) => setDurationDraft((prev) => ({ ...prev, isDefault: checked }))}
                      />
                      <p className="text-xs text-slate-500">Use as default time option</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>Sort order (optional)</Label>
                    <Input
                      value={durationDraft.sortOrder}
                      onChange={(event) => setDurationDraft((prev) => ({ ...prev, sortOrder: event.target.value }))}
                      placeholder="0"
                      type="number"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <Label>ML tags (comma separated)</Label>
                    <Input
                      value={durationDraft.mlTags}
                      onChange={(event) => setDurationDraft((prev) => ({ ...prev, mlTags: event.target.value }))}
                      placeholder="quick, short"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={handleSaveDuration} disabled={creatingDuration || updatingDuration}>
                    {isEditingDuration ? "Save changes" : "Create duration"}
                  </Button>
                  <span className="text-xs text-slate-500">Defaults update immediately on save.</span>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>

        <div className="sticky top-20 self-start ">
          <Card className="border border-slate-200/80 shadow-sm">
            <CardHeader className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Live preview</p>
              <CardTitle className="text-lg text-slate-900">Personalization step</CardTitle>
              <p className="text-xs text-slate-500">
                Preview reflects your current edits before saving.
              </p>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-4">
                <StepPersonalize
                  onNext={() => undefined}
                  onSkip={() => undefined}
                  isPreview
                  hideSaveButton
                  previewInterests={previewInterests}
                  previewTimeDurations={previewDurations}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function EmojiField({
  value,
  onChange,
  options,
  placeholder,
  fallbackEmoji,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  fallbackEmoji?: string;
}) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const previewEmoji = value || fallbackEmoji || "✨";

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (!popoverRef.current) return;
      if (!popoverRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white">
          <EmojiIcon emoji={previewEmoji} size={18} />
        </span>
        <Button variant="outline" size="sm" onClick={() => setOpen((prev) => !prev)}>
          {open ? "Close picker" : "Choose emoji"}
        </Button>
      </div>
        <Button variant="outline" size="sm" onClick={() => setOpen((prev) => !prev)}>
          {open ? "Close picker" : "Open picker"}
        </Button>
      </div>

      <div className="flex flex-wrap gap-1">
        {options.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onChange(emoji)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition",
              value === emoji ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"
            )}
          >
            <EmojiIcon emoji={emoji} size={16} />
          </button>
        ))}
      </div>

      {open ? (
        <div
          ref={popoverRef}
          className="relative z-20 w-full max-w-[360px] rounded-2xl border border-slate-200 bg-white shadow-lg"
        >
          <EmojiPicker
            emojiStyle={EmojiStyle.TWITTER}
            height={320}
            width="100%"
            previewConfig={{ showPreview: false }}
            searchPlaceHolder="Search emojis"
            onEmojiClick={(emojiData) => {
              onChange(emojiData.emoji);
              setOpen(false);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
