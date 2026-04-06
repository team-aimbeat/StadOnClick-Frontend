import { Fragment, useMemo, useState } from "react";
import {
  HiClipboardDocumentList,
  HiOutlineArrowDownTray,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineSparkles,
  HiOutlineXMark,
} from "react-icons/hi2";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { normalizeApiError } from "@/shared/utils/normalizeApiError";
import dayjs from "dayjs";

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
  submittedAt: string;
  submitted: string;
  submittedTime: string;
  fileUrl: string;
  auditTrail: AdminKycAuditLog[];
};

/* ================= HELPERS ================= */

const formatStatus = (
  status: AdminKycDocument["status"],
): TableDoc["status"] => {
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
      submittedAt: doc.submittedAt,
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
  const {
    data = [],
    isFetching,
    isError,
    error,
  } = useGetAllVendorKycDocumentsQuery();

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
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-[28px] bg-white p-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-2">
            <h1 className="text-[28px] font-black tracking-tight text-slate-950">
              Vendor KYC Documents
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              Manage institutional verification workflows and maintain
              compliance standards across your entire supply chain.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="relative overflow-hidden rounded-[16px] bg-[#4f67e8] px-4 py-4 text-white shadow-[0_10px_24px_rgba(79,103,232,0.18)]">
              <div className="absolute right-2 top-2 text-white/10">
                <HiOutlineClock className="h-8 w-8" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">
                Pending Review
              </p>
              <p className="mt-2 text-3xl font-black tracking-tight">
                {documents.filter((doc) => doc.status === "Pending").length}
              </p>
              <p className="mt-1 text-xs text-white/70">Avg. 4.2 hours</p>
            </div>

            <div className="relative overflow-hidden rounded-[16px] bg-[#3651e9] px-4 py-4 text-white shadow-[0_10px_24px_rgba(54,81,233,0.18)]">
              <div className="absolute right-2 top-2 text-white/10">
                <HiOutlineCheckCircle className="h-8 w-8" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">
                Verified Today
              </p>
              <p className="mt-2 text-3xl font-black tracking-tight">
                {
                  documents.filter(
                    (doc) =>
                      doc.status === "Completed" &&
                      dayjs(doc.submittedAt).isSame(dayjs(), "day"),
                  ).length
                }
              </p>
              <p className="mt-1 text-xs text-white/70">+12% vs yesterday</p>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
            {errorMessage}
          </div>
        )}


        {errorMessage && (
          <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
            {errorMessage}
          </div>
        )}

        <div className="rounded-[18px] border border-[#9aa6ff] bg-white px-5 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full border border-[#6d74ff]/25 bg-[#eef2ff] text-[#3651e9]">
                <HiOutlineSparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  Quarterly Compliance Pulse
                </p>
                <p className="text-sm text-slate-500">
                  {documents.length
                    ? `${Math.round((documents.filter((doc) => doc.status === "Completed").length / documents.length) * 100)}% of active vendors have completed their KYC for this quarter.`
                    : "No vendor KYC documents loaded yet."}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-md bg-[#eef3ff] px-3 py-2 text-xs font-semibold text-[#3554e0]">
                <HiOutlineSparkles className="h-4 w-4" />
                Insight: Risk Profile Improved
              </span>
       
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[20px] border border-slate-100 bg-white">
          <div className="flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[18px] font-semibold text-slate-950">
                Recent Submissions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                <HiOutlineClock className="h-4 w-4" />
                Filter
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                <HiOutlineArrowDownTray className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead className="border-t border-slate-100 bg-slate-50 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                <tr>
                  <th className="px-5 py-4">Vendor</th>
                  <th className="px-5 py-4">ID</th>
                  <th className="px-5 py-4">Document Type</th>
                  <th className="px-5 py-4">Submitted Date</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {documents.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-slate-100 last:border-b-0"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 font-semibold text-slate-500">
                          {row.vendor
                            .split(" ")
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {row.vendor}
                          </p>
                          <p className="text-xs text-slate-400">
                            ID: {row.id.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {row.id.slice(0, 6)}
                    </td>
                    <td className="px-5 py-4 text-slate-700">{row.docType}</td>
                    <td className="px-5 py-4">
                      <div className="text-slate-700">{row.submitted}</div>
                      <div className="text-xs text-slate-400">
                        {row.submittedTime}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles(row.status)}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setActiveDoc(row)}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <HiClipboardDocumentList className="h-4 w-4" />
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
              <HiOutlineXMark />
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
                            {new Date(log.createdAt).toLocaleString("en-GB")} ·{" "}
                            {log.performedBy?.firstName}{" "}
                            {log.performedBy?.lastName ?? ""}
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
                    <p className="text-xs text-gray-400">ID: {activeDoc.id}</p>
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
