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

const DOCUMENT_TABLE_COLUMNS = [
  { key: "vendor", label: "Vendor" },
  { key: "docType", label: "Doc Type" },
  { key: "category", label: "Category" },
  { key: "status", label: "Status" },
  { key: "submitted", label: "Submitted" },
  { key: "actions", label: "Actions" },
] as const;

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
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleColumns, setVisibleColumns] = useState<Record<(typeof DOCUMENT_TABLE_COLUMNS)[number]["key"], boolean>>({
    vendor: true,
    docType: true,
    category: true,
    status: true,
    submitted: true,
    actions: true,
  });
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
  const filteredVendorDocs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return vendorDocs;
    return vendorDocs.filter((doc) =>
      [
        doc.vendor,
        doc.docType,
        doc.category,
        doc.status,
        doc.submitted,
        doc.submittedTime,
        doc.id,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [searchTerm, vendorDocs]);
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

          <div className="overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-[0_18px_50px_-38px_rgba(15,23,42,0.18)]">
            <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-lg font-bold text-slate-900">Vendor KYC Documents</p>
                <p className="text-sm text-slate-500">Document review and verification status</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-[220px] rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search documents"
                    className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                    >
                      Columns
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    sideOffset={6}
                    className="w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
                  >
                    {DOCUMENT_TABLE_COLUMNS.map(({ key, label }) => (
                      <DropdownMenuItem
                        key={key}
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-700"
                        onSelect={(event) => {
                          event.preventDefault();
                          setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
                        }}
                      >
                        <span>{label}</span>
                        <span className={visibleColumns[key] ? "text-emerald-600" : "text-slate-400"}>
                          {visibleColumns[key] ? "On" : "Off"}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
             
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3 px-5 pb-5">
                <thead>
                  <tr className="text-left text-[12px] uppercase tracking-[0.12em] text-slate-400">
                    {visibleColumns.vendor && <th className="px-5 py-3 font-semibold">Vendor</th>}
                    {visibleColumns.docType && <th className="px-5 py-3 font-semibold">Doc Type</th>}
                    {visibleColumns.category && <th className="px-5 py-3 font-semibold">Category</th>}
                    {visibleColumns.status && <th className="px-5 py-3 font-semibold">Status</th>}
                    {visibleColumns.submitted && <th className="px-5 py-3 font-semibold">Submitted</th>}
                    {visibleColumns.actions && (
                      <th className="px-5 py-3 font-semibold text-right">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {toolbarSkeleton ? (
                    <tr>
                      <td
                        colSpan={
                          Object.values(visibleColumns).filter(Boolean).length || 1
                        }
                        className="px-5 py-10 text-center text-sm text-slate-500"
                      >
                        Loading documents...
                      </td>
                    </tr>
                  ) : filteredVendorDocs.length ? (
                    filteredVendorDocs.map((row) => (
                      <tr key={row.id} className="rounded-2xl bg-slate-50/70">
                        {visibleColumns.vendor && (
                          <td className="rounded-l-2xl px-5 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={row.avatar}
                                alt={row.vendor}
                                className="h-10 w-10 rounded-xl border border-slate-100 object-cover"
                              />
                              <div>
                                <p className="font-semibold text-slate-900">{row.vendor}</p>
                                <p className="text-[11px] text-slate-500">Vendor account</p>
                              </div>
                            </div>
                          </td>
                        )}
                        {visibleColumns.docType && (
                          <td className="px-5 py-4">
                            <div>
                              <p className="font-semibold text-slate-900">{row.docType}</p>
                              <p className="text-[11px] text-slate-500">{row.id}</p>
                            </div>
                          </td>
                        )}
                        {visibleColumns.category && (
                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
                              {row.category}
                            </span>
                          </td>
                        )}
                        {visibleColumns.status && (
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles(
                                row.status,
                              )}`}
                            >
                              <span className={`h-2 w-2 rounded-full ${getStatusDotColor(row.status)}`} />
                              {row.status}
                            </span>
                          </td>
                        )}
                        {visibleColumns.submitted && (
                          <td className="px-5 py-4">
                            <div className="font-semibold text-slate-700">{row.submitted}</div>
                            <div className="text-xs text-slate-400">{row.submittedTime}</div>
                          </td>
                        )}
                        {visibleColumns.actions && (
                          <td className="rounded-r-2xl px-5 py-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 rounded-full bg-white text-slate-600 shadow-sm hover:bg-slate-50"
                                >
                                  <HiEllipsisHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>

                              <DropdownMenuContent
                                align="end"
                                sideOffset={6}
                                className="w-30 rounded-md border border-gray-200 bg-white p-1 shadow-md"
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
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={
                          Object.values(visibleColumns).filter(Boolean).length || 1
                        }
                        className="px-5 py-10 text-center text-sm text-slate-500"
                      >
                        No documents uploaded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

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
