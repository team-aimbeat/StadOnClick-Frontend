import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { HiOutlineCheckCircle, HiOutlineDocumentText, HiOutlineShieldCheck } from "react-icons/hi2";

import VendorDocumentsTable from "@/components/shared/VendorDocumentsTable";
import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useAppDispatch } from "@/app/hooks";
import { useMockLoader } from "@/lib/useMockLoader";

const VendorKyc = () => {
  const dispatch = useAppDispatch();
  const loading = useMockLoader();
  const [status, setStatus] = useState<"NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED">(
    "PENDING"
  );
  const [rejectionReason] = useState("Document blur detected. Please upload a higher quality copy.");

  useEffect(() => {
    dispatch(setPageTitle("KYC Documents"));
  }, [dispatch]);

  const statusSteps = useMemo(
    () => [
      { label: "Not submitted", value: "NOT_SUBMITTED" },
      { label: "Pending review", value: "PENDING" },
      { label: "Verified", value: "VERIFIED" },
    ],
    []
  );

  if (loading) {
    return (
      <DashboardContainer className="space-y-4 pt-8">
        <div className="h-8 w-1/4 animate-pulse rounded-full bg-slate-200" />
        <div className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer className="space-y-5 pb-10">
      <TitleBreadCrumbs title="KYC Documents" breadCrumbTitle="Vendor / KYC Documents" />

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Status</p>
            <p className="text-lg font-semibold text-slate-900">{status.replace("_", " ")}</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
            <HiOutlineShieldCheck className="h-4 w-4 text-emerald-500" />
            KYC workspace
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {statusSteps.map((step) => {
            const isActive = step.value === status;
            const isComplete =
              step.value === "VERIFIED" && (status === "VERIFIED" || status === "REJECTED");
            return (
              <div
                key={step.value}
                className={`rounded-2xl border px-3 py-3 text-xs font-semibold uppercase tracking-[0.3em] ${
                  isActive
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : isComplete
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-slate-50 text-slate-500"
                }`}
              >
                {step.label}
              </div>
            );
          })}
        </div>
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Upload documents
          </p>
          <p className="mt-1">
            Submit ID proof, business registration, and address proof to complete KYC. Approved docs
            unlock payouts.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStatus("PENDING")}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
            >
              Upload documents
            </button>
            <NavLink
              to="/vendor/help"
              className="text-xs font-semibold text-blue-600 hover:text-blue-500"
            >
              Need help?
            </NavLink>
          </div>
        </div>

        {status === "REJECTED" && (
          <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
            <HiOutlineDocumentText className="inline h-4 w-4" />
            Rejection reason: {rejectionReason}
          </div>
        )}
      </div>

      <VendorDocumentsTable />
    </DashboardContainer>
  );
};

export default VendorKyc;
