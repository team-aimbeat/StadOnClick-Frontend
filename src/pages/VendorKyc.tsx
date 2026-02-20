import { useCallback, useEffect, useMemo, useRef } from "react";
import { NavLink } from "react-router-dom";
import { HiOutlineDocumentText, HiOutlineShieldCheck } from "react-icons/hi2";

import VendorDocumentsTable from "@/components/shared/VendorDocumentsTable";
import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useMockLoader } from "@/lib/useMockLoader";
import { useGetVendorKycDocumentsQuery } from "@/services/vendorKycApi";

const VendorKyc = () => {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const loading = useMockLoader();
  const uploadModalOpenerRef = useRef<() => void>();
  const hasVendorRole = Boolean(authUser?.roles?.includes("VENDOR"));
  const authVendorId = authUser?.vendorAccess?.vendorId ?? null;
  const shouldFetchDocuments = Boolean(authUser && hasVendorRole && authVendorId);
  const { data: documents = [] } = useGetVendorKycDocumentsQuery(authVendorId ?? undefined, {
    skip: !shouldFetchDocuments,
    refetchOnMountOrArgChange: true,
  });

  const kycStatus = useMemo<"NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED">(() => {
    if (!documents.length) {
      return "NOT_SUBMITTED";
    }
    if (documents.some((doc) => doc.status === "REJECTED")) {
      return "REJECTED";
    }
    if (documents.some((doc) => doc.status === "PENDING")) {
      return "PENDING";
    }
    return "VERIFIED";
  }, [documents]);

  const rejectionReason = useMemo(() => {
    const rejected = documents.find((doc) => doc.status === "REJECTED");
    return rejected?.rejectionReason ?? "Document blur detected. Please upload a higher quality copy.";
  }, [documents]);

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

  const handleRegisterUpload = useCallback((open: () => void) => {
    uploadModalOpenerRef.current = open;
  }, []);

  const handleUploadClick = () => {
    uploadModalOpenerRef.current?.();
  };

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
            <p className="text-lg font-semibold text-slate-900">{kycStatus.replace("_", " ")}</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
            <HiOutlineShieldCheck className="h-4 w-4 text-emerald-500" />
            KYC workspace
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {statusSteps.map((step) => {
            const isActive = step.value === kycStatus;
            const isComplete =
              step.value === "VERIFIED" && (kycStatus === "VERIFIED" || kycStatus === "REJECTED");
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


        {kycStatus === "REJECTED" && (
          <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
            <HiOutlineDocumentText className="inline h-4 w-4" />
            Rejection reason: {rejectionReason}
          </div>
        )}
      </div>

      <VendorDocumentsTable registerUploadHandler={handleRegisterUpload} />
    </DashboardContainer>
  );
};

export default VendorKyc;
