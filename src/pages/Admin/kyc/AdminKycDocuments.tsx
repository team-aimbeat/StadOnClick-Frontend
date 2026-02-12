import { useMemo, useState } from "react";
import { HiClipboardDocumentList, HiXMark } from "react-icons/hi2";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import VendorTable from "@/components/shared/CustomTable";
import { normalizeApiError } from "@/shared/utils/normalizeApiError";

import {
  useApproveKycDocumentMutation,
  useGetAllVendorKycDocumentsQuery,
  useRejectKycDocumentMutation,
  useRequestKycReuploadMutation,
} from "@/services/adminKycApi";

/* ================= TYPES ================= */

type AdminVendor = {
  id: string;
  name: string;
  profileImageKey?: string | null;
  avatar?: string | null;
};

type AdminKycAuditLog = {
  action: string;
  comment?: string | null;
  performedBy: {
    firstName: string;
    lastName?: string | null;
    email: string;
  };
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

type TableDoc = {
  id: string;
  vendor: string;
  avatar?: string;
  docType: string;
  status: "Pending" | "Completed" | "Rejected";
  submitted: string;
  submittedTime: string;
  fileUrl: string;
  auditTrail: AdminKycAuditLog[];
};

/* ================= HELPERS ================= */

const formatStatus = (status: AdminKycDocument["status"]): TableDoc["status"] => {
  if (status === "APPROVED") return "Completed";
  if (status === "REJECTED") return "Rejected";
  return "Pending";
};

const statusStyles = (status: TableDoc["status"]) => {
  if (status === "Pending") return "bg-yellow-100 text-yellow-700";
  if (status === "Completed") return "bg-green-100 text-green-700";
  return "bg-rose-100 text-rose-600";
};

const mapAdminDocs = (docs: AdminKycDocument[]): TableDoc[] =>
  docs.map((doc) => {
    const date = new Date(doc.submittedAt);

    return {
      id: doc.id,
      vendor: doc.vendor?.name ?? "Unknown Vendor",
      avatar: doc.vendor?.avatar ?? undefined,
      docType: doc.type.replace(/_/g, " "),
      status: formatStatus(doc.status),
      submitted: date.toLocaleDateString("en-GB"),
      submittedTime: date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      fileUrl: doc.fileUrl,
      auditTrail: doc.auditTrail ?? [],
    };
  });

/* ================= PAGE ================= */

const AdminKycDocumentsPage = () => {
  const { data = [], isFetching, isError, error } =
    useGetAllVendorKycDocumentsQuery();

  const [approve] = useApproveKycDocumentMutation();
  const [reject] = useRejectKycDocumentMutation();
  const [requestReupload] = useRequestKycReuploadMutation();

  const [activeDoc, setActiveDoc] = useState<TableDoc | null>(null);
  const [comment, setComment] = useState("");
  const [remark, setRemark] = useState("");

  const documents = useMemo(() => mapAdminDocs(data), [data]);

  const errorMessage = isError
    ? normalizeApiError(error, "Unable to load KYC documents").toastMessage
    : null;

  /* ================= ACTIONS ================= */

  const handleApprove = async () => {
    if (!activeDoc) return;

    try {
      await approve({
        id: activeDoc.id,
        comment: comment || undefined,
      }).unwrap();

      toast.success("Document approved");
      resetModal();
    } catch (err) {
      toast.error(normalizeApiError(err).toastMessage);
    }
  };

  const handleReject = async () => {
    if (!activeDoc || !remark.trim()) return;

    try {
      await reject({
        id: activeDoc.id,
        remark,
      }).unwrap();

      toast.success("Document rejected");
      resetModal();
    } catch (err) {
      toast.error(normalizeApiError(err).toastMessage);
    }
  };

  const handleReuploadRequest = async () => {
    if (!activeDoc || !remark.trim()) return;

    try {
      await requestReupload({
        id: activeDoc.id,
        remark,
      }).unwrap();

      toast.success("Reupload requested");
      resetModal();
    } catch (err) {
      toast.error(normalizeApiError(err).toastMessage);
    }
  };

  const resetModal = () => {
    setActiveDoc(null);
    setComment("");
    setRemark("");
  };

  /* ================= TABLE ================= */

  const columns = [
    {
      key: "vendor",
      header: "Vendor",
      render: (row: TableDoc) => (
        <div className="flex items-center gap-3">
          <img
            src={row.avatar || "/avatar-placeholder.png"}
            className="h-10 w-10   rounded-full border"
          />
          <span className="font-medium">{row.vendor}</span>
        </div>
      ),
    },
    { key: "docType", header: "Document type" },
    {
      key: "status",
      header: "Status",
      render: (row: TableDoc) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles(
            row.status,
          )}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "submitted",
      header: "Submitted",
      render: (row: TableDoc) => (
        <>
          <div>{row.submitted}</div>
          <div className="text-xs text-gray-400">{row.submittedTime}</div>
        </>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: TableDoc) => (

        <HiClipboardDocumentList  className="h-5 w-5 text-slate-600"onClick={() => setActiveDoc(row)} />
     
      ),
    },
  ];

  const getAuditDotColor = (action: string) => {
  switch (action) {
    case "SUBMITTED":
      return "bg-yellow-400";
    case "APPROVED":
      return "bg-green-500";
    case "REJECTED":
      return "bg-rose-500";
    case "REQUESTED_REUPLOAD":
      return "bg-blue-500";
    default:
      return "bg-slate-400";
  }
};


  /* ================= RENDER ================= */

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          Vendor KYC Documents
        </h1>
        <p className="text-sm text-gray-500">
          Review and verify submitted vendor documents
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
          {errorMessage}
        </div>
      )}

      <VendorTable<TableDoc>
        columns={columns}
        data={documents}
        showToolbar={!isFetching}
      />

    {/* ================= REVIEW MODAL ================= */}
{activeDoc && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
    <div
      className="relative w-full max-w-6xl rounded-2xl bg-white shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close */}
      <button
        onClick={resetModal}
        className="absolute right-4 top-4 rounded-full border p-2"
      >
        <HiXMark />
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* ================= LEFT: DOCUMENT ================= */}
        <div className="bg-gray-50 p-6">
          <img
            src={activeDoc.fileUrl}
            className="w-full rounded-xl border object-contain"
          />

          {/* Audit trail */}
          <div className="mt-6">
            <p className="text-sm font-semibold text-gray-700">
              Audit trail
            </p>

            <div className="mt-4 space-y-4">
              {activeDoc.auditTrail.map((log, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="relative flex w-4 justify-center">
                    <span
                      className={`mt-1 h-2.5 w-2.5 rounded-full ${getAuditDotColor(
                        log.action,
                      )}`}
                    />
                    {index < activeDoc.auditTrail.length - 1 && (
                      <span className="absolute left-1/2 top-4 h-full w-px -translate-x-1/2 bg-gray-200" />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {log.action.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleString("en-GB")} · {log.performedBy?.firstName} {log.performedBy?.lastName ?? ""}
                    </p>
                    {log.comment && (
                      <p className="mt-1 text-xs text-gray-600">
                        {log.comment}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= RIGHT: DETAILS ================= */}
        <div className="flex flex-col p-8  mt-5 mb-5 ml-5 mr-5 bg-gray-50 rounded-2xl">
          {/* Header */}
          <div className="flex items-center gap-3">
            <img
              src={activeDoc.avatar || "/avatar-placeholder.png"}
              className="h-12 w-12 rounded-full border"
            />
            <div>
              <p className="font-semibold text-gray-900">
                {activeDoc.vendor}
              </p>
              <p className="text-xs text-gray-400">
                ID: {activeDoc.id}
              </p>
            </div>
          </div>

          {/* Meta */}
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Document type</span>
              <span className="font-medium">{activeDoc.docType}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Submitted</span>
              <span className="font-medium">
                {activeDoc.submitted} · {activeDoc.submittedTime}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles(
                  activeDoc.status,
                )}`}
              >
                {activeDoc.status}
              </span>
            </div>
          </div>

          {/* Inputs */}
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-semibold">
                Admin comment
              </label>
              <textarea
                className="mt-1 w-full rounded-xl border p-3 text-sm"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Optional comment"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">
                Remark (required for reject / reupload)
              </label>
              <textarea
                className="mt-1 w-full rounded-xl border p-3 text-sm"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Explain why"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto flex gap-3 pt-6">
            <Button
              className="bg-green-600 text-white"
              onClick={handleApprove}
            >
              Approve
            </Button>

            <Button
              className="bg-rose-600 text-white"
              disabled={!remark.trim()}
              onClick={handleReject}
            >
              Reject
            </Button>

            <Button
              variant="outline"
              disabled={!remark.trim()}
              onClick={handleReuploadRequest}
            >
              Request reupload
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

    </>
  );
};

export default AdminKycDocumentsPage;
