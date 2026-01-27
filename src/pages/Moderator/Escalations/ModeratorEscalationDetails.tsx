import { useEffect } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import {
  useModeratorAcceptEscalationMutation,
  useModeratorCommentEscalationMutation,
  useModeratorGetEscalationQuery,
  useModeratorListNotificationsQuery,
  useModeratorMarkNotificationReadMutation,
  useModeratorUpdateEscalationStatusMutation,
} from "@/features/escalations/escalationApi";
import type { EscalationStatus } from "@/features/escalations/escalation.types";
import { useAppSelector } from "@/app/hooks";

import ModeratorEscalationDetailView from "./ModeratorEscalationDetailView";

export default function ModeratorEscalationDetails() {
  const { id } = useParams();
  const escalationId = id ?? "";
  const authUser = useAppSelector((state) => state.auth.user);

  const { data: escalation, isFetching } = useModeratorGetEscalationQuery(escalationId, {
    skip: !escalationId,
  });

  const [acceptEscalation, { isLoading: isAccepting }] =
    useModeratorAcceptEscalationMutation();
  const [updateStatus, { isLoading: isUpdating }] =
    useModeratorUpdateEscalationStatusMutation();
  const [commentEscalation, { isLoading: isCommenting }] =
    useModeratorCommentEscalationMutation();

  const { data: notifications } = useModeratorListNotificationsQuery();
  const [markRead] = useModeratorMarkNotificationReadMutation();

  useEffect(() => {
    if (!escalationId || !notifications?.length) return;
    const unread = notifications.filter(
      (notification) => notification.entityId === escalationId && !notification.readAt
    );
    unread.forEach((notification) => markRead(notification.id));
  }, [escalationId, markRead, notifications]);

  const handleAccept = async () => {
    if (!escalationId) return;
    try {
      await acceptEscalation(escalationId).unwrap();
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to accept escalation");
    }
  };

  const handleUpdateStatus = async (nextStatus: EscalationStatus, summary?: string) => {
    if (!escalationId) return;
    try {
      await updateStatus({ id: escalationId, status: nextStatus, resolutionSummary: summary }).unwrap();
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to update status");
    }
  };

  const handleComment = async (body: string) => {
    if (!escalationId) return;
    try {
      await commentEscalation({ id: escalationId, body }).unwrap();
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to add comment");
    }
  };

  return (
    <div className="space-y-6">
      <TitleBreadCrumbs
        title="Escalation Details"
        breadCrumbTitle="Admin / Moderator / Escalations / Details"
      />

      <ModeratorEscalationDetailView
        escalation={escalation}
        isLoading={isFetching}
        currentUserId={authUser?.id}
        onAccept={handleAccept}
        onUpdateStatus={handleUpdateStatus}
        onComment={handleComment}
        isAccepting={isAccepting}
        isUpdating={isUpdating}
        isCommenting={isCommenting}
      />
    </div>
  );
}

