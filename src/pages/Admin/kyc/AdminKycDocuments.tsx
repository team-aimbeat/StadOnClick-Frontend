import { useMemo, useState } from "react";
import { HiXMark } from "react-icons/hi2";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { normalizeApiError } from "@/shared/utils/normalizeApiError";
import { useApproveKycDocumentMutation, useGetAllVendorKycDocumentsQuery, useRejectKycDocumentMutation } from "@/services/adminKycApi";
import VendorTable from "@/components/shared/CustomTable";

/* ================= TYPES ================= */

type AdminVendor = {
  id: string;
  name: string;
  avatar?: string;
};

type AdminKycDocument = {
  id: string;
  type: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: string;
  fileUrl: string;
  rejectionReason?: string | null;
  vendor: AdminVendor;
  auditTrail: {
    action: string;
    comment?: string | null;
    performedBy: string;
    createdAt: string;
  }[];
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
  auditTrail: AdminKycDocument["auditTrail"];
};

/* ================= HELPERS ================= */

const formatStatus = (status: AdminKycDocument["status"]) => {
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
      vendor: doc.vendor.name,
      avatar: doc.vendor.avatar,
      docType: doc.type.replace("_", " "),
      status: formatStatus(doc.status),
      submitted: date.toLocaleDateString("en-GB"),
      submittedTime: date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      fileUrl: doc.fileUrl,
      auditTrail: doc.auditTrail,
    };
  });

/* ================= PAGE ================= */

const AdminKycDocumentsPage = () => {
  const { data = [], isFetching, isError, error } =
    useGetAllVendorKycDocumentsQuery();

  const [approve] = useApproveKycDocumentMutation();
  const [reject] = useRejectKycDocumentMutation();

  const [activeDoc, setActiveDoc] = useState<TableDoc | null>(null);
  const [comment, setComment] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const documents = useMemo(() => mapAdminDocs(data), [data]);

  const errorMessage = isError
    ? normalizeApiError(error, "Unable to load KYC documents").toastMessage
    : null;

  const handleApprove = async () => {
    if (!activeDoc) return;
    try {
      await approve({ id: activeDoc.id, comment }).unwrap();
      toast.success("Document approved");
      setActiveDoc(null);
      setComment("");
    } catch (err) {
      toast.error(normalizeApiError(err).toastMessage);
    }
  };

  const handleReject = async () => {
    if (!activeDoc || !rejectReason) return;
    try {
      await reject({
        id: activeDoc.id,
        reason: rejectReason,
        comment,
      }).unwrap();
      toast.success("Document rejected");
      setActiveDoc(null);
      setComment("");
      setRejectReason("");
    } catch (err) {
      toast.error(normalizeApiError(err).toastMessage);
    }
  };

  const columns = [
    {
      key: "vendor",
      header: "Vendor",
      render: (row: TableDoc) => (
        <div className="flex items-center gap-3">
          <img
            src={row.avatar}
            className="h-8 w-8 rounded-full border"
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
        <Button size="sm" onClick={() => setActiveDoc(row)}>
          Review
        </Button>
      ),
    },
  ];

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
            className="relative w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveDoc(null)}
              className="absolute right-4 top-4 rounded-full border p-2"
            >
              <HiXMark />
            </button>

            <div className="grid gap-6 md:grid-cols-2">
              <img
                src={activeDoc.fileUrl}
                className="rounded-xl border"
              />

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-semibold">Comment</label>
                  <textarea
                    className="mt-1 w-full rounded-xl border p-3 text-sm"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    Rejection reason (required to reject)
                  </label>
                  <input
                    className="mt-1 w-full rounded-xl border p-3 text-sm"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>

                <div className="mt-auto flex gap-3">
                  <Button
                    className="bg-green-600 text-white"
                    onClick={handleApprove}
                  >
                    Approve
                  </Button>

                  <Button
                    className="bg-rose-600 text-white"
                    disabled={!rejectReason}
                    onClick={handleReject}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </div>

            {/* Audit trail */}
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-700">
                Audit trail
              </p>
              <div className="mt-3 space-y-3">
                {activeDoc.auditTrail.map((log, idx) => (
                  <div key={idx} className="text-xs text-gray-500">
                    <span className="font-semibold">{log.action}</span>{" "}
                    · {new Date(log.createdAt).toLocaleString("en-GB")}
                    {log.comment && ` — ${log.comment}`}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminKycDocumentsPage;
