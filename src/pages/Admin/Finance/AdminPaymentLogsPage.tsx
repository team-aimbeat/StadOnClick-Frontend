import { useState, useMemo } from "react";
import { NavLink } from "react-router-dom";
import dayjs from "dayjs";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { useGetPlatformTransactionsQuery } from "@/features/admin/finance/api/adminFinanceApi";

const AdminPaymentLogsPage = () => {
  const [page, setPage] = useState(1);
  const limit = 25;

  const { data, isFetching, isError } = useGetPlatformTransactionsQuery({ page, limit });
  const rows = data?.data?.data ?? [];
  const meta = data?.data?.meta ?? { totalPages: 1 };

  return (
    <DashboardContainer className="space-y-6 pb-10">
      <TitleBreadCrumbs title="Payment Logs" breadCrumbTitle="Admin / Finance / Payment Logs" />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800">Platform payment activity</p>
          <div className="text-xs text-slate-500">Page {page} of {meta.totalPages ?? 1}</div>
        </div>

        {isFetching && (
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="h-14 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        )}

        {isError && (
          <p className="mt-4 text-sm text-rose-600">Unable to load payment logs right now.</p>
        )}

        {!isFetching && !isError && rows.length === 0 && (
          <p className="mt-4 text-sm text-slate-600">No payment logs found.</p>
        )}

        {!isFetching && !isError && rows.length > 0 && (
          <div className="mt-4 overflow-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Currency</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Wallet</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Direction</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {rows.map((row: any) => (
                  <tr key={row.id ?? `${row.createdAt}-${row.amount}`} className="align-top hover:bg-slate-50">
                    <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                      {row.createdAt ? dayjs(row.createdAt).format("DD MMM YYYY, HH:mm") : "—"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {row.amount ?? row.value ?? 0}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{row.currency ?? row.currencyCode ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">
                      {(() => {
                        const name =
                          row.ownerName ??
                          row.sourceVendor?.businessName ??
                          row.customerName ??
                          row.customer ??
                          row.userName ??
                          row.reference ??
                          row.customerId ??
                          "—";
                        const email =
                          row.ownerEmail ??
                          row.sourceVendor?.contactEmail ??
                          row.customerEmail ??
                          row.email;
                        const type = row.ownerType ?? (row.sourceVendor ? "VENDOR" : undefined);
                        return (
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-800">{name}</span>
                            {type ? (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                {type}
                              </span>
                            ) : null}
                            {email ? <div className="text-[11px] text-slate-500">{email}</div> : null}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {row.walletId ?? row.targetWalletId ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700">{row.type ?? row.sourceType ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{row.direction ?? row.flow ?? "—"}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-800">
                      {row.status ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{row.description ?? row.note ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-50"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => (meta.totalPages ? Math.min(meta.totalPages, p + 1) : p + 1))}
            disabled={meta.totalPages ? page >= meta.totalPages : false}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </DashboardContainer>
  );
};

export default AdminPaymentLogsPage;
