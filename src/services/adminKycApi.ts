import { baseQueryWithReauth } from "@/app/services/baseApi";
import { createApi } from "@reduxjs/toolkit/query/react";

/* ================= TYPES ================= */

type AdminVendor = {
  id: string;
  name: string;
  profileImageKey?: string | null;
  avatar?: string | null;
};

export type AdminKycAuditLog = {
  id: string;
  action: string;
  comment?: string | null;
  performedBy: {
    firstName: string;
    lastName?: string | null;
    email: string;
  };
  createdAt: string;
  document: {
    id: string;
    type: string;
    vendor: {
      user: any;
      id: string;
      firstName: string;
    };
  };
};

type AdminKycDocument = {
  id: string;
  type: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: string;
  fileUrl: string;
  rejectionReason?: string | null;
  vendor: AdminVendor;
  auditTrail: AdminKycAuditLog[];
};

/* ================= API ================= */

export const adminKycApi = createApi({
  reducerPath: "adminKycApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["AdminKyc"],

  endpoints: (builder) => ({
    /* =======================
       GET ALL KYC DOCUMENTS
    ======================= */
    getAllVendorKycDocuments: builder.query<AdminKycDocument[], void>({
      query: () => "/admin/vendors/kyc/documents",
      providesTags: (result) =>
        result
          ? [
              ...result.map((doc) => ({
                type: "AdminKyc" as const,
                id: doc.id,
              })),
              { type: "AdminKyc", id: "LIST" },
            ]
          : [{ type: "AdminKyc", id: "LIST" }],
    }),

    /* =======================
       GET ALL KYC AUDIT LOGS
    ======================= */
getAllKycAuditLogs: builder.query<AdminKycAuditLog[], void>({
  query: () => "/admin/vendors/kyc/audit-logs",
  transformResponse: (response: {
    success: boolean;
    data: AdminKycAuditLog[];
  }) => response.data,
  providesTags: [{ type: "AdminKyc", id: "AUDIT_LOGS" }],
}),


    /* =======================
       APPROVE DOCUMENT
    ======================= */
    approveKycDocument: builder.mutation<
      void,
      { id: string; comment?: string }
    >({
      query: ({ id, comment }) => ({
        url: `/admin/vendors/kyc/${id}/approve`,
        method: "POST",
        body: { comment },
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "AdminKyc", id },
        { type: "AdminKyc", id: "LIST" },
      ],
    }),

    /* =======================
       REJECT DOCUMENT
    ======================= */
    rejectKycDocument: builder.mutation<
      void,
      { id: string; remark: string }
    >({
      query: ({ id, remark }) => ({
        url: `/admin/vendors/kyc/${id}/reject`,
        method: "POST",
        body: { remark },
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "AdminKyc", id },
        { type: "AdminKyc", id: "LIST" },
      ],
    }),

    /* =======================
       REQUEST REUPLOAD
    ======================= */
    requestKycReupload: builder.mutation<
      void,
      { id: string; remark: string }
    >({
      query: ({ id, remark }) => ({
        url: `/admin/vendors/kyc/${id}/reupload`,
        method: "POST",
        body: { remark },
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "AdminKyc", id },
        { type: "AdminKyc", id: "LIST" },
      ],
    }),

    /* =======================
       GET SINGLE DOCUMENT
    ======================= */
    getKycDocumentById: builder.query<AdminKycDocument, string>({
      query: (id) => `/admin/vendors/kyc/${id}`,
    }),
  }),
});

/* ================= HOOKS ================= */

export const {
  useGetAllVendorKycDocumentsQuery,
  useGetAllKycAuditLogsQuery,
  useApproveKycDocumentMutation,
  useRejectKycDocumentMutation,
  useRequestKycReuploadMutation,
  useGetKycDocumentByIdQuery,
} = adminKycApi;
