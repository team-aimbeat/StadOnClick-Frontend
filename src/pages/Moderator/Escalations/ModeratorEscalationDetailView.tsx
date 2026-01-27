import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  EscalationDetail,
  EscalationSeverity,
  EscalationStatus,
} from "@/features/escalations/escalation.types";
import { formatEscalationLabel } from "@/features/escalations/escalation.utils";
import { cn } from "@/lib/utils";

type Props = {
  escalation?: EscalationDetail;
  isLoading?: boolean;
  currentUserId?: string;
  onAccept?: () => void;
  onUpdateStatus?: (status: EscalationStatus, summary?: string) => void;
  onComment?: (body: string) => void;
  isAccepting?: boolean;
  isUpdating?: boolean;
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

const statusOptions: EscalationStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "BLOCKED",
  "RESOLVED",
  "REJECTED",
];

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

export default function ModeratorEscalationDetailView({
  escalation,
  isLoading,
  currentUserId,
  onAccept,
  onUpdateStatus,
  onComment,
  isAccepting,
  isUpdating,
  isCommenting,
}: Props) {
  const [nextStatus, setNextStatus] = useState<EscalationStatus>("OPEN");
  const [summary, setSummary] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (escalation?.status) {
      setNextStatus(escalation.status);
      setSummary("");
      setComment("");
    }
  }, [escalation?.status]);

  const needsSummary = useMemo(
    () => nextStatus === "RESOLVED" || nextStatus === "REJECTED",
    [nextStatus]
  );

  const isAssignedToOther = useMemo(() => {
    if (!escalation?.assignedToModerator) return false;
    if (!currentUserId) return false;
    return escalation.assignedToModerator.id !== currentUserId;
  }, [currentUserId, escalation?.assignedToModerator]);

  const canUpdateStatus = useMemo(() => {
    if (!escalation || !onUpdateStatus || isAssignedToOther) return false;
    if (needsSummary && summary.trim().length < 3) return false;
    return true;
  }, [escalation, isAssignedToOther, needsSummary, onUpdateStatus, summary]);

  const canComment = useMemo(() => {
    return Boolean(onComment && comment.trim().length >= 2);
  }, [comment, onComment]);

  if (!escalation) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-slate-500">
        {isLoading ? "Loading escalation..." : "Select an escalation to view details."}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border border-slate-200/80 shadow-sm">
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={cn("border text-[11px] font-semibold", statusTone[escalation.status])}>
              {formatEscalationLabel(escalation.status)}
            </Badge>
            <Badge variant="outline" className={cn("border text-[11px] font-semibold", severityTone[escalation.severity])}>
              {formatEscalationLabel(escalation.severity)}
            </Badge>
            <Badge variant="outline" className="border text-[11px] font-semibold">
              {formatEscalationLabel(escalation.category)}
            </Badge>
            <span className="text-xs text-slate-500">
              Escalated {formatDateTime(escalation.createdAt)}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900">{escalation.reason}</h3>
            <p className="mt-1 text-sm text-slate-600">{escalation.description}</p>
          </div>

          <div className="grid gap-3 text-xs text-slate-500 sm:grid-cols-2">
            <DetailRow label="Ticket" value={escalation.ticket?.ticketNumber ?? "-"} />
            <DetailRow label="Vendor" value={escalation.ticket?.vendor.businessName ?? "-"} />
            <DetailRow label="Assigned" value={escalation.assignedToModerator ? `${escalation.assignedToModerator.firstName} ${escalation.assignedToModerator.lastName ?? ""}`.trim() : "Unassigned"} />
            <DetailRow label="Last activity" value={formatDateTime(escalation.ticket?.lastActivityAt)} />
          </div>

          {escalation.resolutionSummary ? (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-sm text-emerald-800">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500">
                Resolution summary
              </p>
              <p className="mt-2">{escalation.resolutionSummary}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border border-slate-200/80 shadow-sm">
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-3">
            {!escalation.assignedToModerator && onAccept ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onAccept}
                disabled={isAccepting || isAssignedToOther}
                className="gap-2"
              >
                <ShieldCheck className="h-4 w-4" />
                {isAccepting ? "Accepting..." : "Accept"}
              </Button>
            ) : null}

            <Select
              value={nextStatus}
              onValueChange={(value) => setNextStatus(value as EscalationStatus)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {formatEscalationLabel(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              size="sm"
              onClick={() => onUpdateStatus?.(nextStatus, summary.trim() || undefined)}
              disabled={!canUpdateStatus || isUpdating}
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isUpdating ? "Updating..." : "Update status"}
            </Button>
          </div>

          {needsSummary ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Resolution summary
              </p>
              <Textarea
                rows={3}
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                placeholder="Summarize the resolution for the support team."
              />
            </div>
          ) : null}

          <Separator />

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Internal discussion
            </p>
            {escalation.comments?.length ? (
              <div className="space-y-3">
                {escalation.comments.map((commentItem) => (
                  <div
                    key={commentItem.id}
                    className="rounded-xl border border-slate-200/80 bg-white px-4 py-3"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">
                        {commentItem.author
                          ? `${commentItem.author.firstName} ${commentItem.author.lastName ?? ""}`.trim()
                          : "Moderator"}
                      </span>
                      <span>{formatDateTime(commentItem.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{commentItem.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No comments yet.</p>
            )}

            {onComment ? (
              <div className="space-y-2">
                <Textarea
                  rows={3}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Add an internal comment or request more info."
                />
                <div className="flex justify-end">
                  <Button size="sm" onClick={() => {
                    if (!canComment) return;
                    onComment?.(comment.trim());
                    setComment("");
                  }} disabled={!canComment || isCommenting}>
                    {isCommenting ? "Posting..." : "Add comment"}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {escalation.ticket ? (
        <Card className="border border-slate-200/80 shadow-sm">
          <CardContent className="space-y-3 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Ticket context
            </p>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {escalation.ticket.subject}
              </p>
              <p className="text-xs text-slate-500">
                {escalation.ticket.ticketNumber} - {escalation.ticket.vendor.businessName}
              </p>
            </div>
            <p className="text-sm text-slate-600">
              {escalation.ticket.lastMessagePreview || "No recent messages."}
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
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
