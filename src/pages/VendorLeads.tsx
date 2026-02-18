import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  HiOutlineArrowDownTray,
  HiOutlineChevronDown,
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlinePhone,
} from "react-icons/hi2";
import toast from "react-hot-toast";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/app/hooks";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import {
  useExportVendorLeadsMutation,
  useGetVendorLeadsQuery,
  useUpdateVendorLeadStatusMutation,
} from "@/features/leads/api/leadsApi";
import type { LeadStatus, VendorLeadItem } from "@/features/leads/types/leads.types";
import { useListServiceCategoriesQuery } from "@/services/serviceCategoriesApi";

const statusOptions: LeadStatus[] = ["NEW", "CONTACTED", "CONVERTED", "LOST"];

const formatLeadStatusLabel = (status: LeadStatus) =>
  status
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

const formatTimestamp = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));

type LeadCardProps = {
  lead: VendorLeadItem;
  categoryLabel?: string;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (status: LeadStatus) => void;
  isSaving?: boolean;
};

const LeadCard = ({
  lead,
  categoryLabel,
  expanded,
  onToggle,
  onStatusChange,
  isSaving,
}: LeadCardProps) => {
  const isLocked = lead.isLocked;
  const message = isLocked
    ? "Upgrade your plan to unlock contact details and the full enquiry."
    : lead.lead.message ?? "—";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase text-slate-700">
            {lead.status}
          </span>
          {isLocked ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
              <HiOutlineLockClosed className="h-4 w-4" />
              Locked
            </span>
          ) : null}
        </div>
        <div className="text-right text-sm font-semibold text-slate-500">
          {formatTimestamp(lead.createdAt)}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-lg font-bold text-slate-900">{lead.lead.name}</p>
          <p className="text-sm text-slate-700">
            Category: {categoryLabel ?? "Unknown"}
          </p>
          <p className="text-xs text-slate-500">Sequence #{lead.sequenceInDay}</p>
        </div>
        <div className="flex items-center gap-3 self-center">
          <a
            className={cn(
              "grid h-11 w-11 place-items-center rounded-lg border text-base font-semibold transition focus:outline-none focus:ring-2",
              isLocked || !lead.lead.phone
                ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                : "border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 focus:ring-blue-200"
            )}
            href={lead.lead.phone ? `tel:${lead.lead.phone}` : undefined}
            aria-disabled={isLocked || !lead.lead.phone}
          >
            <HiOutlinePhone className="h-5 w-5" />
          </a>
          <a
            className={cn(
              "grid h-11 w-11 place-items-center rounded-lg border text-base font-semibold transition focus:outline-none focus:ring-2",
              isLocked || !lead.lead.email
                ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                : "border-sky-600 bg-sky-600 text-white hover:bg-sky-700 hover:border-sky-700 focus:ring-sky-200"
            )}
            href={lead.lead.email ? `mailto:${lead.lead.email}` : undefined}
            aria-disabled={isLocked || !lead.lead.email}
          >
            <HiOutlineEnvelope className="h-5 w-5" />
          </a>
        </div>
      </div>

      {expanded ? (
        <div className="mt-3 space-y-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.15em] text-slate-500">
              Enquiry
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-800">{message}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.15em] text-slate-500">
              Contact
            </p>
            <p className="mt-1 text-sm text-slate-700">
              {isLocked ? "Locked" : lead.lead.email ?? "—"}
              {lead.lead.phone ? ` • ${isLocked ? "Locked" : lead.lead.phone}` : ""}
            </p>
          </div>
          {lead.lockReason ? (
            <p className="text-xs font-semibold text-amber-700">
              {lead.lockReason === "NO_SUBSCRIPTION"
                ? "No active subscription."
                : "Daily quota exceeded."}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggle}
            className="text-sm font-semibold text-blue-600 hover:text-blue-500"
          >
            {expanded ? "Hide details" : "View details"}
          </button>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            <span>Status</span>
            <select
              value={lead.status}
              onChange={(event) => onStatusChange(event.target.value as LeadStatus)}
              className="rounded-full border-none bg-transparent px-1 text-xs font-semibold focus:outline-none"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {isSaving ? <span className="text-[11px] text-emerald-600">Saving…</span> : null}
          </div>
        </div>
        {isLocked ? (
          <Link
            to="/vendor/leads/subscription"
            className="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700"
          >
            Upgrade plan to unlock
            <HiOutlineChevronDown className="h-4 w-4 rotate-[-90deg]" />
          </Link>
        ) : (
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            Send Quotation
          </button>
        )}
      </div>
    </div>
  );
};

const VendorLeads = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get("status");
  const statusFilter = statusOptions.includes(statusParam as LeadStatus)
    ? (statusParam as LeadStatus)
    : undefined;

  const { data: categories = [] } = useListServiceCategoriesQuery();
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((category) => map.set(category.id, category.name));
    return map;
  }, [categories]);

  const { data, isLoading } = useGetVendorLeadsQuery({
    page: 1,
    limit: 20,
    status: statusFilter,
  });

  const [updateStatus] = useUpdateVendorLeadStatusMutation();
  const [exportVendorLeads, { isLoading: isExporting }] = useExportVendorLeadsMutation();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const statusHeading = statusFilter
    ? `${formatLeadStatusLabel(statusFilter)} Leads`
    : "All Leads";

  useEffect(() => {
    dispatch(setPageTitle(statusHeading));
  }, [dispatch, statusHeading]);

  const leads = data?.data ?? [];
  const total = data?.meta.total ?? leads.length;
  const respondedCount = leads.filter((lead) => lead.status !== "NEW").length;

  const handleStatusFilterChange = (status?: LeadStatus) => {
    if (!status) {
      navigate("/vendor/leads", { replace: true });
    } else {
      navigate(`/vendor/leads?status=${status}`, { replace: true });
    }
  };

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    setSavingId(id);
    try {
      await updateStatus({ id, status }).unwrap();
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to update lead status.");
    } finally {
      setSavingId(null);
    }
  };

  const handleExport = async () => {
    try {
      const file = await exportVendorLeads({
        status: statusFilter,
      }).unwrap();

      const url = URL.createObjectURL(file);
      const anchor = document.createElement("a");
      const dateStamp = new Date().toISOString().slice(0, 10);
      anchor.href = url;
      anchor.download = `vendor-leads-${dateStamp}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to export leads.");
    }
  };

  return (
    <DashboardContainer className="space-y-4 lg:space-y-5">
      <TitleBreadCrumbs
        title={statusHeading}
        breadCrumbTitle={`Vendor / ${statusHeading}`}
        className="w-full"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xl font-bold text-slate-900">Leads Inbox</p>
          <p className="text-sm text-slate-600">Track enquiries shared with your business.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-600">
          <span className="rounded-md bg-white px-3 py-1.5 text-slate-800 shadow-sm ring-1 ring-slate-200">
            Leads Received: {total}
          </span>
          <span className="rounded-md bg-white px-3 py-1.5 text-slate-700 shadow-sm ring-1 ring-slate-200">
            Leads Responded: {respondedCount}
          </span>
          <span className="rounded-md bg-white px-3 py-1.5 text-slate-700 shadow-sm ring-1 ring-slate-200">
            Viewing: {leads.length}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
        <label className="relative inline-flex h-10 items-center">
          <select
            value={statusFilter ?? "ALL"}
            onChange={(event) =>
              handleStatusFilterChange(
                event.target.value === "ALL" ? undefined : (event.target.value as LeadStatus)
              )
            }
            aria-label="Status"
            className="h-10 appearance-none rounded-md border border-slate-200 bg-white px-4 pr-8 text-sm font-semibold text-slate-700 transition focus:border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">Any status</option>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {formatLeadStatusLabel(option)}
              </option>
            ))}
          </select>
          <HiOutlineChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-slate-500" />
        </label>
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <HiOutlineArrowDownTray className="h-4 w-4" />
          {isExporting ? "Exporting..." : "Export Excel"}
        </button>
      </div>

      <div className="space-y-4">
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            categoryLabel={categoryMap.get(lead.lead.categoryId)}
            expanded={expanded[lead.id] ?? false}
            onToggle={() =>
              setExpanded((prev) => ({ ...prev, [lead.id]: !prev[lead.id] }))
            }
            onStatusChange={(status) => handleStatusChange(lead.id, status)}
            isSaving={savingId === lead.id}
          />
        ))}
        {!isLoading && leads.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center">
            <p className="text-sm font-semibold text-slate-800">
              No leads match the selected filters.
            </p>
            <p className="text-sm text-slate-500">Try a different status filter.</p>
          </div>
        ) : null}
      </div>
    </DashboardContainer>
  );
};

export default VendorLeads;
