import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "@/app/services/baseApi";
import type {
  ApiResponse,
  EscalationCategory,
  EscalationComment,
  EscalationDetail,
  EscalationInboxItem,
  EscalationSeverity,
  EscalationStatus,
  ModeratorNotification,
  PaginatedEscalations,
} from "./escalation.types";

type AdminCreateEscalationRequest = {
  ticketId: string;
  category: EscalationCategory;
  severity: EscalationSeverity;
  reason: string;
  description: string;
};

type AdminListEscalationsRequest = {
  ticketId: string;
};

type AdminCommentEscalationRequest = {
  escalationId: string;
  body: string;
};

type AdminAssignEscalationRequest = {
  escalationId: string;
  assignedToModeratorId: string | null;
};

type ModeratorListEscalationsQuery = {
  search?: string;
  status?: EscalationStatus;
  category?: EscalationCategory;
  severity?: EscalationSeverity;
  assigned?: "me" | "unassigned" | "all";
  page?: number;
  limit?: number;
  resolvedFrom?: string;
  resolvedTo?: string;
};

type ModeratorUpdateEscalationStatusRequest = {
  id: string;
  status: EscalationStatus;
  resolutionSummary?: string;
};

type ModeratorCommentEscalationRequest = {
  id: string;
  body: string;
};

export const escalationApi = createApi({
  reducerPath: "escalationApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Escalations", "Escalation", "EscalationComments", "Notifications"],
  endpoints: (builder) => ({
    adminCreateEscalation: builder.mutation<EscalationDetail, AdminCreateEscalationRequest>({
      query: ({ ticketId, ...body }) => ({
        url: `/admin/support/tickets/${ticketId}/escalations`,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<EscalationDetail>) => response.data,
      invalidatesTags: (_result, _error, arg) => [
        { type: "Escalations", id: arg.ticketId },
        { type: "Escalations", id: "LIST" },
      ],
    }),

    adminListTicketEscalations: builder.query<EscalationDetail[], AdminListEscalationsRequest>({
      query: ({ ticketId }) => ({
        url: `/admin/support/tickets/${ticketId}/escalations`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<EscalationDetail[]>) => response.data,
      providesTags: (result, _err, arg) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Escalation" as const, id })),
              { type: "Escalations" as const, id: arg.ticketId },
            ]
          : [{ type: "Escalations" as const, id: arg.ticketId }],
    }),

    adminCommentEscalation: builder.mutation<EscalationComment, AdminCommentEscalationRequest>({
      query: ({ escalationId, body }) => ({
        url: `/admin/support/escalations/${escalationId}/comments`,
        method: "POST",
        body: { body },
      }),
      transformResponse: (response: ApiResponse<EscalationComment>) => response.data,
      invalidatesTags: (_result, _error, arg) => [
        { type: "EscalationComments", id: arg.escalationId },
        { type: "Escalation", id: arg.escalationId },
      ],
    }),

    adminAssignEscalation: builder.mutation<EscalationDetail, AdminAssignEscalationRequest>({
      query: ({ escalationId, assignedToModeratorId }) => ({
        url: `/admin/support/escalations/${escalationId}/assign`,
        method: "PATCH",
        body: { assignedToModeratorId },
      }),
      transformResponse: (response: ApiResponse<EscalationDetail>) => response.data,
      invalidatesTags: (_result, _error, arg) => [
        { type: "Escalation", id: arg.escalationId },
        { type: "Escalations", id: "LIST" },
      ],
    }),

    moderatorListEscalations: builder.query<
      PaginatedEscalations<EscalationInboxItem>,
      ModeratorListEscalationsQuery | void
    >({
      query: (params) => ({
        url: "/moderator/escalations",
        method: "GET",
        params: params ?? undefined,
      }),
      transformResponse: (response: ApiResponse<PaginatedEscalations<EscalationInboxItem>>) =>
        response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: "Escalation" as const, id })),
              { type: "Escalations" as const, id: "LIST" },
            ]
          : [{ type: "Escalations" as const, id: "LIST" }],
    }),

    moderatorGetEscalation: builder.query<EscalationDetail, string>({
      query: (id) => ({
        url: `/moderator/escalations/${id}`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<EscalationDetail>) => response.data,
      providesTags: (_result, _error, id) => [
        { type: "Escalation", id },
        { type: "EscalationComments", id },
      ],
    }),

    moderatorAcceptEscalation: builder.mutation<EscalationDetail, string>({
      query: (id) => ({
        url: `/moderator/escalations/${id}/accept`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<EscalationDetail>) => response.data,
      invalidatesTags: (_result, _error, id) => [
        { type: "Escalation", id },
        { type: "Escalations", id: "LIST" },
      ],
    }),

    moderatorUpdateEscalationStatus: builder.mutation<
      EscalationDetail,
      ModeratorUpdateEscalationStatusRequest
    >({
      query: ({ id, status, resolutionSummary }) => ({
        url: `/moderator/escalations/${id}/status`,
        method: "PATCH",
        body: { status, resolutionSummary },
      }),
      transformResponse: (response: ApiResponse<EscalationDetail>) => response.data,
      invalidatesTags: (_result, _error, arg) => [
        { type: "Escalation", id: arg.id },
        { type: "Escalations", id: "LIST" },
      ],
    }),

    moderatorCommentEscalation: builder.mutation<EscalationComment, ModeratorCommentEscalationRequest>({
      query: ({ id, body }) => ({
        url: `/moderator/escalations/${id}/comments`,
        method: "POST",
        body: { body },
      }),
      transformResponse: (response: ApiResponse<EscalationComment>) => response.data,
      invalidatesTags: (_result, _error, arg) => [
        { type: "EscalationComments", id: arg.id },
        { type: "Escalation", id: arg.id },
      ],
    }),

    moderatorListNotifications: builder.query<ModeratorNotification[], void>({
      query: () => ({
        url: "/moderator/notifications",
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<ModeratorNotification[]>) => response.data,
      providesTags: [{ type: "Notifications", id: "LIST" }],
    }),

    moderatorMarkNotificationRead: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/moderator/notifications/${id}/read`,
        method: "PATCH",
      }),
      transformResponse: (response: { success: boolean }) => response,
      invalidatesTags: [{ type: "Notifications", id: "LIST" }],
    }),

    moderatorReadAllNotifications: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: "/moderator/notifications/read-all",
        method: "PATCH",
      }),
      transformResponse: (response: { success: boolean }) => response,
      invalidatesTags: [{ type: "Notifications", id: "LIST" }],
    }),
  }),
});

export const {
  useAdminCreateEscalationMutation,
  useAdminListTicketEscalationsQuery,
  useAdminCommentEscalationMutation,
  useAdminAssignEscalationMutation,
  useModeratorListEscalationsQuery,
  useModeratorGetEscalationQuery,
  useModeratorAcceptEscalationMutation,
  useModeratorUpdateEscalationStatusMutation,
  useModeratorCommentEscalationMutation,
  useModeratorListNotificationsQuery,
  useModeratorMarkNotificationReadMutation,
  useModeratorReadAllNotificationsMutation,
} = escalationApi;
