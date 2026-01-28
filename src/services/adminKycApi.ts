import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"; 
 
  type AdminVendor = {
  id: string;
  name: string;
  avatar?: string | null;
};

 type AdminKycAuditLog = {
  action: string;
  comment?: string | null;
  performedBy: string;
  createdAt: string;
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


export const adminKycApi = createApi({
  reducerPath: "adminKycApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["AdminKyc"],
  endpoints: (builder) => ({
    /* =======================
       GET ALL KYC DOCUMENTS
    ======================= */
    getAllVendorKycDocuments: builder.query<AdminKycDocument[], void>({
      query: () => "/admin/kyc/documents",
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
       APPROVE DOCUMENT
    ======================= */
    approveKycDocument: builder.mutation<
      void,
      { id: string; comment?: string }
    >({
      query: ({ id, comment }) => ({
        url: `/admin/kyc/documents/${id}/approve`,
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
      { id: string; reason: string; comment?: string }
    >({
      query: ({ id, reason, comment }) => ({
        url: `/admin/kyc/documents/${id}/reject`,
        method: "POST",
        body: { reason, comment },
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "AdminKyc", id },
        { type: "AdminKyc", id: "LIST" },
      ],
    }),
  }),
});


export const {
  useGetAllVendorKycDocumentsQuery,
  useApproveKycDocumentMutation,
  useRejectKycDocumentMutation,
} = adminKycApi;
