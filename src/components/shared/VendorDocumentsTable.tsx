import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HiEllipsisHorizontal, HiXMark } from "react-icons/hi2";
import { toast } from "react-hot-toast";
import { useAppSelector } from "@/app/hooks";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type ColumnConfig } from "@/components/shared/DataTable";
import profile7 from "@/assets/Images/profile-7.jpeg";

import {
  useGetVendorKycDocumentsQuery,
  useUploadVendorKycDocumentMutation,
  VendorKycDocument,
  VendorKycDocumentStatus,
  VendorKycDocumentType,
} from "@/services/vendorKycApi";
import { normalizeApiError } from "@/shared/utils/normalizeApiError";
import { useGetMeQuery } from "@/features/auth/api/authApi";

export type VendorProfile = {
  name: string;
  id: string | number;
  avatar?: string;
  location?: string;
  verified?: boolean;
};

export type VendorDoc = {
  id: string;
  vendor: string;
  avatar: string;
  docImage: string;
  vendorId: VendorProfile["id"];
  documents: { name: string; src: string }[];
  docType: string;
  category: string;
  status: "Pending" | "Completed" | "Rejected" | "Under Review";
  submitted: string;
  submittedTime: string;
  rejectionReason?: string | null;
  fileUrl?: string;
  auditTrail?: {
    action: string;
    comment?: string;
    performedBy: {
      firstName: string;
      lastName?: string | null;
      email: string;
    };
    createdAt: string;
  }[];
};

const DOCUMENT_TYPES: { value: VendorKycDocumentType; label: string }[] = [
  { value: "GOVERNMENT_ID", label: "Government ID" },
  { value: "BUSINESS_LICENSE", label: "Business license" },
  { value: "TAX_DOCUMENT", label: "Tax document" },
  { value: "BANK_PROOF", label: "Bank proof" },
];

const documentTypeLabels: Record<VendorKycDocumentType, string> = {
  GOVERNMENT_ID: "Government ID",
  BUSINESS_LICENSE: "Business license",
  TAX_DOCUMENT: "Tax document",
  BANK_PROOF: "Bank proof",
};

const statusStyles = (status: VendorDoc["status"]) => {
  if (status === "Pending") {
    return "bg-yellow-100 text-yellow-700";
  }
  if (status === "Completed") {
    return "bg-green-100 text-green-700";
  }
  if (status === "Rejected") {
    return "bg-rose-100 text-rose-600";
  }
  return "bg-blue-100 text-blue-700";
};

const formatDocumentStatus = (
  status: VendorKycDocumentStatus,
): VendorDoc["status"] => {
  if (status === "APPROVED") {
    return "Completed";
  }
  if (status === "REJECTED") {
    return "Rejected";
  }
  return "Pending";
};

const defaultVendor: VendorProfile = {
  name: "Vendor",
  id: "",
  avatar: profile7,
  location: "",
  verified: false,
};

const mapKycDocuments = (
  docs: VendorKycDocument[],
  vendor: VendorProfile,
): VendorDoc[] =>
  docs.map((doc) => {
    const typeLabel = documentTypeLabels[doc.type] ?? doc.type;
    const createdAt = new Date(doc.submittedAt);
    const formattedDate = createdAt.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const formattedTime = createdAt.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return {
      id: doc.id,
      vendor: vendor.name,
      vendorId: vendor.id,
      avatar: vendor.avatar ?? profile7,
      docImage: doc.fileUrl,
      documents: [
        {
          name: `${typeLabel} • ${formattedDate}`,
          src: doc.fileUrl,
        },
      ],
      docType: typeLabel,
      category: typeLabel,
      status: formatDocumentStatus(doc.status),
      submitted: formattedDate,
      submittedTime: formattedTime,
      rejectionReason: doc.rejectionReason ?? undefined,
      fileUrl: doc.fileUrl,
      auditTrail: doc.auditTrail.map((entry) => ({
        action: entry.action,
        comment: entry.comment ?? undefined,
        performedBy: entry.performedBy,
        createdAt: entry.createdAt,
      })),
    };
  });

type VendorDocumentsTableProps = {
  vendor?: VendorProfile;
  registerUploadHandler?: (open: () => void) => void;
};

const VendorDocumentsTable = ({
  vendor = defaultVendor,
  registerUploadHandler,
}: VendorDocumentsTableProps) => {
  const authUser = useAppSelector((state) => state.auth.user);
  const hasVendorRole = Boolean(authUser?.roles?.includes("VENDOR"));
  const authVendorId = authUser?.vendorAccess?.vendorId ?? null;
  const shouldFetchDocuments = Boolean(
    authUser && hasVendorRole && authVendorId,
  );

  const {
    data: documents = [],
    isFetching,
    isError,
    error,
  } = useGetVendorKycDocumentsQuery(authVendorId ?? undefined, {
    skip: !shouldFetchDocuments,
    refetchOnMountOrArgChange: true,
  });
  const [uploadVendorKycDocument, { isLoading: isUploading }] =
    useUploadVendorKycDocumentMutation();
  const [selectedType, setSelectedType] = useState<VendorKycDocumentType>(
    DOCUMENT_TYPES[0].value,
  );
  const [uploadOpen, setUploadOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [viewDoc, setViewDoc] = useState<VendorDoc | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const vendorAvatar = vendor.avatar ?? profile7;

  const { data } = useGetMeQuery();
  const user = data?.user;

  const resolvedVendor: VendorProfile = useMemo(
    () => ({
      id: authVendorId ?? vendor.id,
      name: user?.displayName || vendor.name || "Vendor",
      avatar:  user?.profileImageUrl ?? profile7,
      location: vendor.location ?? "",
      verified: vendor.verified ?? false,
    }),
    [authVendorId, user?.displayName, user?.profileImageUrl, vendor],
  );

  const vendorDocs = useMemo(
    () => mapKycDocuments(documents, resolvedVendor),
    [documents, resolvedVendor],
  );
  const vendorStatusLabel = resolvedVendor.verified ? "Verified" : "Pending";

  const normalizedQueryError = useMemo(() => {
    if (!isError) return null;
    return normalizeApiError(error, "Unable to load your documents.");
  }, [error, isError]);

  const vendorNotFound = normalizedQueryError?.formError === "VENDOR_NOT_FOUND";

  const vendorIssueMessage = vendorNotFound
    ? "We can’t find your vendor profile right now. Complete onboarding or contact support to proceed."
    : !shouldFetchDocuments
      ? "You need a verified vendor session to access KYC documents."
      : undefined;

  const generalQueryErrorMessage =
    isError && !vendorNotFound ? normalizedQueryError?.toastMessage : undefined;

  useEffect(() => {
    if (registerUploadHandler) {
      registerUploadHandler(() => setUploadOpen(true));
    }
  }, [registerUploadHandler]);

  const handleUploadFiles = useCallback(
    async (files: FileList | File[]) => {
      if (!selectedType) {
        toast.error("Select a document type before uploading.");
        return;
      }
      if (!files.length) {
        return;
      }

      try {
        for (const file of files) {
          const formData = new FormData();
          formData.append("type", selectedType);
          formData.append("file", file);
          await uploadVendorKycDocument(formData).unwrap();
        }
        toast.success("Document uploaded successfully.");
        setUploadOpen(false);
      } catch (error) {
        const normalized = normalizeApiError(
          error,
          "Unable to upload document",
        );
        toast.error(normalized.toastMessage);
      }
    },
    [selectedType, uploadVendorKycDocument],
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleUploadFiles(files);
      event.target.value = "";
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleUploadFiles(event.dataTransfer.files);
      event.dataTransfer.clearData();
    }
  };

  const columns: ColumnConfig[] = [
    // { key: "id", header: "ID", width: "90px" },
    {
      key: "vendor",
      title: "Vendor",
      render: (_value: unknown, row: VendorDoc) => (
        <div className="flex items-center gap-3">
          <img
            src={row.avatar}
            alt={row.vendor}
            className="w-8 h-8 rounded-full border border-gray-200"
          />
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {row.vendor}
          </span>
        </div>
      ),
    },
    { key: "docType", title: "Doc type" },
    { key: "category", title: "Category" },
    {
      key: "status",
      title: "Status",
      render: (_value: unknown, row: VendorDoc) => (
        <span
          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusStyles(
            row.status,
          )}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "submitted",
      title: "Submitted",
      render: (_value: unknown, row: VendorDoc) => (
        <div>
          <div className="text-gray-900 dark:text-gray-100">
            {row.submitted}
          </div>
          <div className="text-xs text-gray-400">{row.submittedTime}</div>
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (_value: unknown, row: VendorDoc) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-md bg-gray-100 hover:bg-gray-200"
            >
              <HiEllipsisHorizontal className="h-4 w-4 text-gray-700" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={6}
            className="w-30 rounded-md p-1 bg-white shadow-md border border-gray-200"
          >
            <DropdownMenuItem
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700"
              onSelect={() => setViewDoc(row)}
            >
              View
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1" />

            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 focus:text-red-600">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const activityLogEntries = useMemo(
    () => viewDoc?.auditTrail ?? [],
    [viewDoc],
  );

  const toolbarSkeleton = isFetching && vendorDocs.length === 0;
  const vendorEmail = user?.email ?? "Vendor";
  const vendorname =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    resolvedVendor.name;
  const phone = user?.phone;


  const getStatusDotColor = (status: string) => {
    switch (status) {
      case "SUBMITTED":
      case "PENDING":
        return "bg-yellow-400";

      case "APPROVED":
        return "bg-green-500";

      case "REJECTED":
        return "bg-rose-500";

      case "REQUESTED_REUPLOAD":
        return "bg-blue-500";

      default:
        return "bg-gray-400";
    }
  };

  return (
    <>
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Documents & Verification
              </p>
              <p className="text-xs text-gray-500">
                Upload and manage your business documents.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <img
                src={resolvedVendor.avatar ?? profile7}
                alt={resolvedVendor.name}
                className="h-10 w-10 rounded-full border border-gray-200 object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {vendorname}
                  <span className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-medium ">
                    {phone}
                  </span>
                  <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                    {vendorStatusLabel}
                  </span>
                </p>
                <p className="text-xs text-gray-400">
                  Email: {vendorEmail}
                  {resolvedVendor.location
                    ? ` · ${resolvedVendor.location}`
                    : ""}
                </p>
              </div>
            </div>
          </div>
          <Button
            className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            onClick={() => setUploadOpen(true)}
            disabled={
              !shouldFetchDocuments ||
              Boolean(vendorIssueMessage) ||
              isUploading
            }
          >
            Upload document
          </Button>
        </div>
      </div>

      {vendorIssueMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-4 text-sm font-semibold text-rose-700">
          {vendorIssueMessage}
        </div>
      ) : (
        <>
          {generalQueryErrorMessage && (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm font-semibold text-rose-700">
              {generalQueryErrorMessage}
            </div>
          )}

          <DataTable
            title="KYC Documents"
            breadCrumbTitle="Vendor / KYC Documents"
            columns={columns}
            data={vendorDocs}
            loading={toolbarSkeleton}
            searchable
            selectable={false}
            showSerialNumber={false}
            noRecordText="No documents uploaded yet."
            className="shadow-none border border-gray-200 rounded-2xl"
          />

          {uploadOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
              onClick={() => setUploadOpen(false)}
            >
              <div
                className="relative w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setUploadOpen(false)}
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-100"
                >
                  <HiXMark className="h-4 w-4" />
                </button>

                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Documents & Verification
                    </p>
                    <p className="text-xs text-gray-500">
                      Upload and manage your business documents. Approved
                      documents increase trust.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <img
                      src={vendorAvatar ?? vendorAvatar}
                      alt="Vendor profile"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {resolvedVendor.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>ID: {resolvedVendor.id}</span>
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                          {vendorStatusLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-gray-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Upload a new document
                      </p>
                      <p className="text-xs text-gray-500">
                        Business registration, insurance certificate, owner ID,
                        tax documents (PDF, JPG, PNG)
                      </p>
                    </div>
                    <Button
                      className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? "Uploading…" : "Upload document"}
                    </Button>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className="text-xs font-semibold text-gray-500">
                      Document type
                    </span>
                    <Select
                      value={selectedType}
                      onValueChange={(value) =>
                        setSelectedType(value as VendorKycDocumentType)
                      }
                    >
                      <SelectTrigger className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 outline-none focus:border-blue-500 focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="w-full rounded-2xl border border-gray-200 bg-white">
                        {DOCUMENT_TYPES.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div
                    className={`mt-4 rounded-xl border border-dashed px-4 py-6 text-center text-xs ${
                      isDragging
                        ? "border-blue-400 bg-blue-50 text-blue-600"
                        : "border-blue-200 bg-blue-50/30 text-gray-500"
                    }`}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                  >
                    Drag & drop files here, or click "Upload document"
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>
          )}

          {viewDoc && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6"
              onClick={() => setViewDoc(null)}
            >
              <div
                className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="border-b border-gray-200 px-6 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={viewDoc.avatar}
                        alt={viewDoc.vendor}
                        className="h-10 w-10 rounded-full border border-gray-200 object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {viewDoc.vendor}
                        </p>
                        <p className="text-xs text-gray-500">
                          Vendor verification · Documents & audit trail
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles(
                          viewDoc.status,
                        )}`}
                      >
                        {viewDoc.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => setViewDoc(null)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-100"
                      >
                        <HiXMark className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 bg-gray-50 p-5 md:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Uploaded documents
                        </p>
                        <p className="text-xs text-gray-500">
                          {viewDoc.documents.length} files · Click a card to
                          open viewer
                        </p>
                      </div>
                      <input
                        placeholder="Search documents..."
                        className="h-9 w-full max-w-[180px] rounded-full border border-gray-200 px-3 text-xs text-gray-600 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      {viewDoc.documents.map((doc) => (
                        <div
                          key={doc.name}
                          className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-[10px] font-semibold text-gray-500">
                              PDF
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900">
                                {doc.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                PDF · 1.2 MB
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between gap-2">
                            <span className="   px-3 py-1 text-xs "></span>
                            <Button
                              variant="outline"
                              className="h-8 rounded-full border-gray-300 px-4 text-xs text-gray-600 hover:bg-gray-100"
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <p className="text-sm font-semibold text-gray-900">
                      Verification workflow
                    </p>
                    <p className="text-xs text-gray-500">
                      Progress and recorded actions
                    </p>

                    <div className="mt-4 rounded-xl bg-gray-50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">
                            Current status
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {viewDoc.status}
                          </p>
                        </div>
                        <span className="rounded-full border border-emerald-300 bg-emerald-50 px-4 py-1 text-xs font-semibold text-emerald-600">
                          OK
                        </span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs font-semibold text-gray-700">
                        Activity log
                      </p>
                      <div className="mt-3 space-y-4">
                        {activityLogEntries.map((entry, index) => (
                          <div
                            key={`${entry.action}-${index}`}
                            className="flex items-start gap-3"
                          >
                            <div className="relative flex w-4 justify-center">
                              <span
                                className={`mt-1 h-2.5 w-2.5 rounded-full ${getStatusDotColor(
                                  entry.action,
                                )}`}
                              />

                              {index < activityLogEntries.length - 1 ? (
                                <span className="absolute left-1/2 top-4 h-6 w-px -translate-x-1/2 bg-gray-200" />
                              ) : null}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {entry.action}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(entry.createdAt).toLocaleString(
                                  "en-GB",
                                )}{" "}
                                · {entry.performedBy?.firstName}{" "}
                                {entry.performedBy?.lastName ?? ""}
                              </p>
                              {entry.comment && (
                                <p className="text-xs text-gray-500">
                                  {entry.comment}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                        {!activityLogEntries.length && (
                          <div className="text-xs text-gray-400">
                            No activity recorded yet.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default VendorDocumentsTable;
