import { useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  HiOutlineArrowDown,
  HiOutlineArrowDownTray,
  HiOutlineArrowUp,
  HiOutlineCalendarDays,
  HiOutlineFunnel,
  HiOutlinePrinter,
} from "react-icons/hi2";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { useGetPlatformTransactionsQuery } from "@/features/admin/finance/api/adminFinanceApi";

const typeTone = (type?: string) => {
  switch ((type ?? "").toUpperCase()) {
    case "SUBSCRIPTION_FEE":
      return "bg-blue-100 text-blue-700";
    case "COMMISSION":
      return "bg-violet-100 text-violet-700";
    case "REFUND":
      return "bg-rose-100 text-rose-700";
    case "PAYOUT":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

const statusTone = (status?: string) => {
  switch ((status ?? "").toUpperCase()) {
    case "COMPLETED":
    case "SUCCESS":
    case "PAID":
    case "CONFIRMED":
      return "bg-emerald-100 text-emerald-700";
    case "PENDING":
    case "PROCESSING":
      return "bg-amber-100 text-amber-700";
    case "CANCELLED":
    case "FAILED":
      return "bg-slate-100 text-slate-600";
    case "REFUNDED":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

const directionMeta = (direction?: string) => {
  if ((direction ?? "").toUpperCase() === "CREDIT") {
    return { label: "Inbound", icon: HiOutlineArrowDown, tone: "text-emerald-700" };
  }

  return { label: "Outbound", icon: HiOutlineArrowUp, tone: "text-rose-700" };
};

const AdminPaymentLogsPage = () => {
  const [page, setPage] = useState(1);
  const limit = 25;
  const rangeLabel = "Last 30 Days";

  const { data, isFetching, isError } = useGetPlatformTransactionsQuery({ page, limit });
  const rows = data?.data?.data ?? [];
  const meta = data?.data?.meta ?? { totalPages: 1, total: rows.length };
  const totalPages = Math.max(1, Number(meta.totalPages ?? 1));
  const totalCount = Number(meta.total ?? rows.length);

  const pageItems = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, idx) => idx + 1);
    }

    if (page <= 3) return [1, 2, 3, 4, totalPages];
    if (page >= totalPages - 2) return [1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, page - 1, page, page + 1, totalPages];
  }, [page, totalPages]);

  const visiblePages = useMemo(() => {
    const ordered = Array.from(new Set(pageItems.filter((n) => n >= 1 && n <= totalPages))).sort(
      (a, b) => a - b,
    );
    const result: Array<number | "..."> = [];

    ordered.forEach((item, index) => {
      const prev = ordered[index - 1];
      if (index > 0 && prev !== undefined && item - prev > 1) {
        result.push("...");
      }
      result.push(item);
    });

    return result;
  }, [pageItems, totalPages]);

  return (
    <DashboardContainer className="space-y-6 pb-10">
      <TitleBreadCrumbs title="Payment Logs" breadCrumbTitle="Admin / Finance / Payment Logs" />

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white ">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">Payment Logs</p>
            <p className="mt-1 text-sm text-slate-500">Platform payment activity</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
      
          </div>
        </div>

        {isFetching && (
          <div className="space-y-3 px-6 py-5">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="h-16 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        )}

        {isError && <p className="px-6 py-5 text-sm text-rose-600">Unable to load payment logs right now.</p>}

        {!isFetching && !isError && rows.length === 0 && (
          <p className="px-6 py-5 text-sm text-slate-600">No payment logs found.</p>
        )}

        {!isFetching && !isError && rows.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 text-sm">
                <thead className="bg-[#f5f6f8] text-left text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Owner / Wallet</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Direction</th>
                    <th className="px-6 py-4">Amount</th>
                    
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row: any) => {
                    const ownerName =
                      row.ownerName ??
                      row.sourceVendor?.businessName ??
                      row.customerName ??
                      row.customer ??
                      row.userName ??
                      row.reference ??
                      row.customerId ??
                      "—";
                    const ownerEmail =
                      row.ownerEmail ??
                      row.sourceVendor?.contactEmail ??
                      row.customerEmail ??
                      row.email;
                    const walletId = row.walletId ?? row.targetWalletId ?? "—";
                    const amountValue = Number(row.amount ?? row.value ?? 0);
                    const dir = directionMeta(row.direction ?? row.flow);

                    return (
                      <tr
                        key={row.id ?? `${row.createdAt}-${row.amount}`}
                        className="border-b border-slate-100 transition hover:bg-slate-50/70"
                      >
                        <td className="whitespace-nowrap px-6 py-5">
                          <div className="space-y-0.5">
                            <div className="text-sm font-semibold text-slate-900">
                              {row.createdAt ? dayjs(row.createdAt).format("MMM DD, YYYY") : "—"}
                            </div>
                            <div className="text-xs text-slate-500">
                              {row.createdAt ? dayjs(row.createdAt).format("hh:mm A [UTC]") : "—"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-0.5">
                            <div className="font-semibold text-[#3554e0]">{ownerName}</div>
                            {ownerEmail ? <div className="text-xs text-slate-500">{ownerEmail}</div> : null}
                            <div className="text-[11px] text-slate-400">{walletId}</div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${typeTone(
                              row.type ?? row.sourceType,
                            )}`}
                          >
                            {row.type ?? row.sourceType ?? "—"}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className={`inline-flex items-center gap-2 ${dir.tone}`}>
                            <dir.icon className="h-4 w-4" />
                            <span className="text-sm font-medium text-slate-700">{dir.label}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-0.5">
                            <div className="text-sm font-semibold text-slate-950">
                              {Number.isFinite(amountValue)
                                ? `$${amountValue.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}`
                                : "—"}
                            </div>
                            <div className="text-xs text-slate-500">{row.currency ?? row.currencyCode ?? "USD"}</div>
                          </div>
                        </td>
                        
                       
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Showing {Math.min((page - 1) * limit + 1, totalCount)} to{" "}
                {Math.min(page * limit, totalCount)} of {totalCount.toLocaleString()} results
              </p>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Prev
                </button>
                {visiblePages.map((item, index) =>
                  item === "..." ? (
                    <span key={`dots-${index}`} className="px-2 text-slate-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPage(item)}
                      className={`h-9 min-w-9 rounded-full px-3 text-sm font-semibold transition ${
                        page === item
                          ? "bg-[#3554e0] text-white"
                          : "border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {item}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardContainer>
  );
};

export default AdminPaymentLogsPage;
