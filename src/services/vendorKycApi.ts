import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/services/baseApi";

export type VendorKycDocumentType =
  | "GOVERNMENT_ID"
  | "BUSINESS_LICENSE"
  | "TAX_DOCUMENT"
  | "BANK_PROOF";

export type VendorKycDocumentStatus = "PENDING" | "APPROVED" | "REJECTED";

export type VendorKycAuditAction =
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "REQUESTED_REUPLOAD";

export type VendorKycAuditTrail = {
  action: VendorKycAuditAction;
  comment?: string | null;
  performedBy: {
    firstName: string;
    lastName?: string | null;
    email: string;
  };
  createdAt: string;
};

export type VendorKycDocument = {
  id: string;
  type: VendorKycDocumentType;
  status: VendorKycDocumentStatus;
  submittedAt: string;
  rejectionReason: string | null;
  fileUrl: string;
  auditTrail: VendorKycAuditTrail[];
};

export const vendorKycApi = createApi({
  reducerPath: "vendorKycApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["VendorKycDocument"],
  endpoints: (builder) => ({
    getVendorKycDocuments: builder.query<VendorKycDocument[], void>({
      query: () => "/vendor/kyc/documents",
      providesTags: (result) =>
        result
          ? [
              ...result.map((doc) => ({
                type: "VendorKycDocument" as const,
                id: doc.id,
              })),
              { type: "VendorKycDocument" as const, id: "LIST" },
            ]
          : [{ type: "VendorKycDocument" as const, id: "LIST" }],
    }),
    uploadVendorKycDocument: builder.mutation<VendorKycDocument, FormData>({
      query: (body) => ({
        url: "/vendor/kyc/documents",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "VendorKycDocument", id: "LIST" }],
    }),
  }),
});

export const {
  useGetVendorKycDocumentsQuery,
  useUploadVendorKycDocumentMutation,
} = vendorKycApi;
