import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { EscalationDetail, EscalationSeverity, EscalationStatus } from "@/features/escalations/escalation.types";
import { cn } from "@/lib/utils";

type Props = {
  escalation: EscalationDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddComment?: (body: string) => void;
  isCommenting?: boolean;
};

const severityTone: Record<EscalationSeverity, string> = {
  LOW: "bg-slate-100 text-slate-600 border-slate-200",
  MEDIUM: "bg-blue-50 text-blue-700 border-blue-200",
  HIGH: "bg-amber-50 text-amber-700 border-amber-200",
  URGENT: "bg-rose-50 text-rose-700 border-rose-200",
};

const statusTone: Record<EscalationStatus, string> = {
  OPEN: "bg-blue-50 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-indigo-50 text-indigo-700 border-indigo-200",
  BLOCKED: "bg-amber-50 text-amber-700 border-amber-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-slate-100 text-slate-600 border-slate-200",
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

export default function EscalationDetailsDialog({
  escalation,
  open,
  onOpenChange,
  onAddComment,
  isCommenting,
}: Props) {
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (open) {
      setComment("");
    }
  }, [open]);

  const canComment = useMemo(() => {
    return Boolean(onAddComment && comment.trim().length >= 2);
  }, [comment, onAddComment]);

  const handleSubmit = () => {
    if (!canComment || !onAddComment) return;
    onAddComment(comment.trim());
    setComment("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Escalation details</DialogTitle>
        </DialogHeader>

        {!escalation ? (
          <div className="py-8 text-sm text-slate-500">Select an escalation to view details.</div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={cn("border text-[11px] font-semibold", statusTone[escalation.status])}>
                {escalation.status}
              </Badge>
              <Badge variant="outline" className={cn("border text-[11px] font-semibold", severityTone[escalation.severity])}>
                {escalation.severity}
              </Badge>
              <Badge variant="outline" className="border text-[11px] font-semibold">
                {escalation.category}
              </Badge>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">{escalation.reason}</p>
              <p className="mt-1 text-sm text-slate-600">{escalation.description}</p>
            </div>

            {escalation.resolutionSummary ? (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-sm text-emerald-800">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500">
                  Resolution summary
                </p>
                <p className="mt-2">{escalation.resolutionSummary}</p>
              </div>
            ) : null}

            <div className="grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
              <DetailRow label="Created" value={formatDateTime(escalation.createdAt)} />
              <DetailRow label="Updated" value={formatDateTime(escalation.updatedAt)} />
              <DetailRow label="Resolved" value={formatDateTime(escalation.resolvedAt)} />
              <DetailRow
                label="Assigned"
                value={
                  escalation.assignedToModerator
                    ? `${escalation.assignedToModerator.firstName} ${escalation.assignedToModerator.lastName ?? ""}`.trim()
                    : "Unassigned"
                }
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Internal comments
              </p>
              {escalation.comments?.length ? (
                <div className="space-y-3">
                  {escalation.comments.map((commentItem) => (
                    <div key={commentItem.id} className="rounded-xl border border-slate-200/80 bg-white p-3">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">
                          {commentItem.author
                            ? `${commentItem.author.firstName} ${commentItem.author.lastName ?? ""}`.trim()
                            : "Team member"}
                        </span>
                        <span>{formatDateTime(commentItem.createdAt)}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-700">{commentItem.body}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No internal comments yet.</p>
              )}

              {onAddComment ? (
                <div className="space-y-2">
                  <Textarea
                    rows={3}
                    placeholder="Add an internal note for the moderator."
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button size="sm" onClick={handleSubmit} disabled={!canComment || isCommenting}>
                      {isCommenting ? "Posting..." : "Add comment"}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className="font-medium text-slate-700">{value}</span>
    </div>
  );
}
