import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/services/baseApi";
import type {
  ApiResponse,
  PaginatedTickets,
  SupportTicket,
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
  TicketMessage,
  TicketParticipant,
} from "./support.types";

type VendorTicketsQuery = {
  status?: SupportTicketStatus;
  page?: number;
  limit?: number;
};

type AdminTicketsQuery = {
  status?: SupportTicketStatus;
  priority?: SupportTicketPriority;
  category?: SupportTicketCategory;
  assignedTo?: string;
  search?: string;
  page?: number;
  limit?: number;
};

type CreateTicketRequest = {
  subject: string;
  description: string;
  priority: SupportTicketPriority;
  category?: SupportTicketCategory;
};

type UpdateStatusRequest = { id: string; status: SupportTicketStatus };
type AssignTicketRequest = { id: string; assignedToUserId: string | null };
type VendorReplyRequest = { id: string; body: string };
type VendorMessagesRequest = { id: string };
type AdminMessagesRequest = { id: string };
type AdminSendMessageRequest = { id: string; body: string };
type JoinTicketRequest = { id: string };
type MarkReadRequest = { id: string };

export const supportApi = createApi({
  reducerPath: "supportApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["SupportTickets", "SupportTicket", "SupportTicketMessages", "SupportUnread"],
  endpoints: (builder) => ({
    vendorListTickets: builder.query<PaginatedTickets<SupportTicket>, VendorTicketsQuery | void>({
      query: (params) => ({
        url: "/vendor/support/tickets",
        method: "GET",
        params,
      }),
      transformResponse: (response: ApiResponse<PaginatedTickets<SupportTicket>>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: "SupportTicket" as const, id })),
              { type: "SupportTickets" as const, id: "LIST" },
            ]
          : [{ type: "SupportTickets" as const, id: "LIST" }],
    }),

    vendorGetTicket: builder.query<SupportTicket, string>({
      query: (id) => ({
        url: `/vendor/support/tickets/${id}`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<SupportTicket>) => response.data,
      providesTags: (_result, _err, id) => [{ type: "SupportTicket", id }],
    }),

    vendorCreateTicket: builder.mutation<SupportTicket, CreateTicketRequest>({
      query: (body) => ({
        url: "/vendor/support/tickets",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<SupportTicket>) => response.data,
      invalidatesTags: [{ type: "SupportTickets", id: "LIST" }],
    }),

    vendorReplyTicket: builder.mutation<TicketMessage, VendorReplyRequest>({
      query: ({ id, body }) => ({
        url: `/vendor/support/tickets/${id}/messages`,
        method: "POST",
        body: { body },
      }),
      transformResponse: (response: ApiResponse<TicketMessage>) => response.data,
      invalidatesTags: (_result, _error, arg) => [
        { type: "SupportTicket", id: arg.id },
        { type: "SupportTickets", id: "LIST" },
        { type: "SupportTicketMessages", id: arg.id },
      ],
    }),

    vendorGetTicketMessages: builder.query<TicketMessage[], VendorMessagesRequest>({
      query: ({ id }) => ({
        url: `/vendor/support/tickets/${id}/messages`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<TicketMessage[]>) => response.data,
      providesTags: (_result, _err, arg) => [{ type: "SupportTicketMessages", id: arg.id }],
    }),

    adminListTickets: builder.query<PaginatedTickets<SupportTicket>, AdminTicketsQuery | void>({
      query: (params) => ({
        url: "/admin/support/tickets",
        method: "GET",
        params,
      }),
      transformResponse: (response: ApiResponse<PaginatedTickets<SupportTicket>>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: "SupportTicket" as const, id })),
              { type: "SupportTickets" as const, id: "LIST" },
            ]
          : [{ type: "SupportTickets" as const, id: "LIST" }],
    }),

    adminGetTicket: builder.query<SupportTicket, string>({
      query: (id) => ({
        url: `/admin/support/tickets/${id}`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<SupportTicket>) => response.data,
      providesTags: (_result, _err, id) => [{ type: "SupportTicket", id }],
    }),

    adminUpdateStatus: builder.mutation<SupportTicket, UpdateStatusRequest>({
      query: ({ id, status }) => ({
        url: `/admin/support/tickets/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (response: ApiResponse<SupportTicket>) => response.data,
      invalidatesTags: (_result, _error, arg) => [
        { type: "SupportTicket", id: arg.id },
        { type: "SupportTickets", id: "LIST" },
      ],
    }),

    adminAssignTicket: builder.mutation<SupportTicket, AssignTicketRequest>({
      query: ({ id, assignedToUserId }) => ({
        url: `/admin/support/tickets/${id}/assign`,
        method: "PATCH",
        body: { assignedToUserId },
      }),
      transformResponse: (response: ApiResponse<SupportTicket>) => response.data,
      invalidatesTags: (_result, _error, arg) => [
        { type: "SupportTicket", id: arg.id },
        { type: "SupportTickets", id: "LIST" },
      ],
    }),

    adminGetTicketMessages: builder.query<TicketMessage[], AdminMessagesRequest>({
      query: ({ id }) => ({
        url: `/admin/support/tickets/${id}/messages`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<TicketMessage[]>) => response.data,
      providesTags: (_result, _err, arg) => [{ type: "SupportTicketMessages", id: arg.id }],
    }),

    adminSendTicketMessage: builder.mutation<TicketMessage, AdminSendMessageRequest>({
      query: ({ id, body }) => ({
        url: `/admin/support/tickets/${id}/messages`,
        method: "POST",
        body: { body },
      }),
      transformResponse: (response: ApiResponse<TicketMessage>) => response.data,
      invalidatesTags: (_result, _error, arg) => [
        { type: "SupportTicketMessages", id: arg.id },
        { type: "SupportTicket", id: arg.id },
        { type: "SupportTickets", id: "LIST" },
      ],
    }),

    adminJoinTicket: builder.mutation<TicketParticipant, JoinTicketRequest>({
      query: ({ id }) => ({
        url: `/admin/support/tickets/${id}/join`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<TicketParticipant>) => response.data,
      invalidatesTags: (_result, _error, arg) => [
        { type: "SupportTicket", id: arg.id },
        { type: "SupportTickets", id: "LIST" },
      ],
    }),

    adminMarkTicketRead: builder.mutation<{ success: boolean }, MarkReadRequest>({
      query: ({ id }) => ({
        url: `/admin/support/tickets/${id}/read`,
        method: "POST",
      }),
      transformResponse: (response: { success: boolean }) => response,
      invalidatesTags: (_result, _error, arg) => [
        { type: "SupportTicket", id: arg.id },
        { type: "SupportTickets", id: "LIST" },
        { type: "SupportUnread", id: "COUNT" },
      ],
    }),

    adminUnreadCount: builder.query<{ total: number }, void>({
      query: () => ({
        url: "/admin/support/unread-count",
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<{ total: number }>) => response.data,
      providesTags: [{ type: "SupportUnread", id: "COUNT" }],
    }),
  }),
});

export const {
  useVendorListTicketsQuery,
  useVendorGetTicketQuery,
  useVendorCreateTicketMutation,
  useVendorReplyTicketMutation,
  useVendorGetTicketMessagesQuery,
  useAdminListTicketsQuery,
  useAdminGetTicketQuery,
  useAdminUpdateStatusMutation,
  useAdminAssignTicketMutation,
  useAdminGetTicketMessagesQuery,
  useAdminSendTicketMessageMutation,
  useAdminJoinTicketMutation,
  useAdminMarkTicketReadMutation,
  useAdminUnreadCountQuery,
} = supportApi;
