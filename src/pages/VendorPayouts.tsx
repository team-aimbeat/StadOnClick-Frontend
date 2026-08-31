import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  HiOutlineExclamationTriangle,
  HiOutlineArrowDownTray,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineFunnel,
} from "react-icons/hi2";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useAppDispatch } from "@/app/hooks";
import { 
  useGetWalletSummaryQuery, 
  useGetWalletTransactionsQuery, 
  useRequestPayoutMutation 
} from "@/features/vendorWallet/api/walletApi";
import { useGetStripeStatusQuery } from "@/features/vendorStripe/api/vendorStripeApi";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import VendorPayoutsSkeleton from "@/components/skeletons/VendorPayoutsSkeleton";
import { cn } from "@/lib/utils";

const VendorPayouts = () => {
  const dispatch = useAppDispatch();
  const [requestAmount, setRequestAmount] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data: summaryData, isLoading: isSummaryLoading } = useGetWalletSummaryQuery();
  const { data: stripeData, isLoading: isStripeLoading } = useGetStripeStatusQuery();
  const { data: transactionsData, isLoading: isTransactionsLoading } = useGetWalletTransactionsQuery({
    page: 1,
    limit: 50,
  });
  const [requestPayout, { isLoading: isPayoutRequesting }] = useRequestPayoutMutation();

  useEffect(() => {
    dispatch(setPageTitle("Settlements"));
  }, [dispatch]);

  const summary = summaryData?.data;
  const stripe = stripeData?.data;
  const payoutHistory = (transactionsData?.data || []).filter(tx => tx.type === 'PAYOUT' || tx.type === 'REFUND');

  const readablePayoutRows = payoutHistory.map((tx: any, idx: number) => {
    const sanitizePayoutText = (value: string) => {
      if (!value) return value;

      return value
        .replace(/ch_[A-Za-z0-9]+/g, (match) => `${match.slice(0, 8)}…`)
        .replace(
          /[0-9a-fA-F]{8,}-[0-9a-fA-F-]{27,}/g,
          (match) => `${match.slice(0, 6)}…${match.slice(-4)}`,
        );
    };

    return {
      ...tx,
      displayReference: `Txn ${String(idx + 1).padStart(4, "0")}`,
      displayAmount: Number(tx.amount || 0),
      displayDescription: tx.description ? sanitizePayoutText(tx.description) : "Payout adjustment",
    };
  });

  const filteredPayoutRows = readablePayoutRows.filter((tx: any) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "PAID") return tx.status === "CONFIRMED";
    return tx.status === statusFilter;
  });

  const stripeConnected = stripe?.payoutsEnabled;

  const csvExport = useMemo(() => {
    const headers = ["Logged Date", "Volume", "State", "Adjudication / Details"];
    const escapeCell = (value: string) => `"${String(value).replace(/"/g, '""')}"`;
    const rows = filteredPayoutRows.map((tx: any) => [
      dayjs(tx.createdAt).format("DD MMM YYYY"),
      `${summary?.currency ?? "SEK"} ${Number(tx.displayAmount || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
      })}`,
      tx.status,
      tx.displayDescription,
    ]);

    return [headers, ...rows]
      .map((row) => row.map((cell) => escapeCell(cell)).join(","))
      .join("\n");
  }, [filteredPayoutRows, summary?.currency]);

  const handleExportCsv = () => {
    const blob = new Blob([csvExport], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "settlement-audit-log.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirm = async () => {
    const amount = parseFloat(requestAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid settlement amount");
      return;
    }

    try {
      await requestPayout({ amount }).unwrap();
      toast.success("Settlement request acknowledged");
      setModalOpen(false);
      setRequestAmount("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Transfer protocols failed");
    }
  };

  if (isSummaryLoading || isStripeLoading || isTransactionsLoading) {
    return <VendorPayoutsSkeleton />;
  }

  return (
    <DashboardContainer className="space-y-8 pb-12">
      <div className="space-y-3">
        <TitleBreadCrumbs title="Settlement Control" breadCrumbTitle="Finance / Payouts" />
        <div className="flex justify-start md:justify-end">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.22em] text-blue-500">
            Status: Operational
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-3">
 
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-200"
            >
              <HiOutlineArrowDownTray className="h-4 w-4 text-slate-500" />
              Export Report
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-blue-600 px-4 text-sm font-semibold text-white transition-all hover:bg-blue-700"
            >
              Manual Release
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.05fr_1.4fr]">
          <div className="finance-card flex min-h-[250px] flex-col rounded-[1.75rem] p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-600">
                  Liquidity Overview
                </p>
                <p className="text-lg font-bold text-slate-900">Awaiting Release</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <HiOutlineClock className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 space-y-1">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                {summary?.currency}
              </p>
              <p className="text-[2.4rem] font-black leading-none tracking-tight text-slate-950">
                {summary?.pendingPayoutBalance?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </p>
              <p className="text-sm text-slate-500">
                Held balance awaiting manual release.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setModalOpen(true)}
                disabled={!stripeConnected || !summary?.availableBalance}
                className="inline-flex h-11 items-center rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Request Transfer
              </button>
              <NavLink
                to="/vendor/wallet"
                className="text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
              >
                View Full Ledger →
              </NavLink>
            </div>

            {!stripeConnected && (
              <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-[11px] font-medium leading-relaxed text-amber-700">
                <div className="mb-2 flex items-center gap-2 font-bold">
                  <HiOutlineExclamationTriangle className="h-4 w-4" />
                  Compliance Required
                </div>
                Stripe payout infrastructure is not yet active. Complete onboarding to enable
                transfers.
                <div className="mt-3">
                  <NavLink
                    to="/vendor/stripe"
                    className="inline-flex items-center gap-1 font-black uppercase tracking-tighter text-slate-950 hover:underline"
                  >
                    Sync Stripe Console &rarr;
                  </NavLink>
                </div>
              </div>
            )}
          </div>

          <div className="finance-card rounded-[1.75rem] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                  Manual Reconciliation
                </p>
                <h3 className="mt-2 text-xl font-black tracking-tight text-slate-950">
                  Manual Release for Held Funds
                </h3>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                Protocol System
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Current Value
                </p>
                <p className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {summary?.currency}
                </p>
                <p className="text-[1.5rem] font-black tracking-tight text-slate-950">
                  {summary?.lockedBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Transferable Volume
                </p>
                <p className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {summary?.currency}
                </p>
                <p className="text-[1.5rem] font-black tracking-tight text-slate-950">
                  {summary?.availableBalance?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-[1.3fr_0.8fr]">
              <input
                type="text"
                inputMode="decimal"
                value={requestAmount}
                onChange={(event) => setRequestAmount(event.target.value)}
                placeholder="Enter manual amount..."
                className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:bg-white"
              />
              <button
                type="button"
                disabled={!stripeConnected || !requestAmount}
                onClick={() => setModalOpen(true)}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Submit Protocol
              </button>
            </div>
          </div>
        </div>

        <div className="finance-card rounded-[1.75rem] p-6">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-[1.15rem] font-black tracking-tight text-slate-950">
                Settlement Audit Log
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Real-time ledger of all historical and pending financial operations.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
              >
                <HiOutlineFunnel className="h-4 w-4 text-slate-500" />
                Filter by adjudication
              </button>
              <div className="flex rounded-full border border-slate-200 bg-slate-50 p-1 text-[11px] font-bold">
                {["ALL", "PENDING", "PAID", "REJECTED"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "rounded-full px-3 py-1.5 uppercase tracking-[0.16em] transition-all",
                      statusFilter === status
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700",
                    )}
                  >
                    {status.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[900px] border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                    Logged Date
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                    Volume
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                    State
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                    Adjudication / Details
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayoutRows.length ? (
                  filteredPayoutRows.map((tx: any) => (
                    <tr key={tx.id} className="border-t border-slate-100">
                      <td className="px-4 py-4 align-top">
                        <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                          {dayjs(tx.createdAt).format("DD")}
                        </div>
                        <div className="mt-2">
                          <p className="text-sm font-semibold text-slate-700">
                            {dayjs(tx.createdAt).format("DD MMM")}
                          </p>
                          <p className="text-xs text-slate-400">
                            {dayjs(tx.createdAt).format("YYYY")}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <span
                          className={cn(
                            "text-sm font-black tracking-tight",
                            tx.direction === "CREDIT" ? "text-emerald-600" : "text-rose-600",
                          )}
                        >
                          {tx.direction === "CREDIT" ? "+" : "-"}
                          {summary?.currency} {tx.displayAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <span
                          className={cn(
                            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em]",
                            tx.status === "CONFIRMED"
                              ? "bg-emerald-50 text-emerald-700"
                              : tx.status === "PENDING"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-rose-50 text-rose-700",
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              tx.status === "CONFIRMED"
                                ? "bg-emerald-500"
                                : tx.status === "PENDING"
                                  ? "bg-amber-500"
                                  : "bg-rose-500",
                            )}
                          />
                          {tx.status.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="max-w-[340px]">
                          <p className="text-[13px] font-semibold text-slate-950">
                            {tx.displayDescription}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {tx.displayReference}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <button
                          type="button"
                          onClick={() => setModalOpen(true)}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-50"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-500">
                      No historical transfer events registered
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold text-slate-500">
              Showing {filteredPayoutRows.length} of {readablePayoutRows.length} entries
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-50"
              >
                <HiOutlineArrowDownTray className="h-4 w-4 text-slate-500" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/20 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-[2rem] p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-slate-950 tracking-tighter">Authorize Transfer</h3>
            <div className="mt-6 flex items-baseline gap-2 mb-2">
               <span className="text-sm font-medium text-slate-400">{summary?.currency}</span>
               <p className="text-4xl font-metric text-metric tracking-tighter">
                 {parseFloat(requestAmount).toLocaleString() || "0.00"}
               </p>
            </div>
            <p className="mt-4 text-[11px] text-slate-500 font-medium leading-relaxed mb-8">
              Use this only for held funds that were not automatically routed at payment time. The transfer will be sent to your connected Stripe payout account after review.
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                disabled={isPayoutRequesting}
                onClick={handleConfirm}
                className="w-full rounded-2xl bg-slate-950 py-5 text-[11px] font-black text-white uppercase tracking-[0.2em] transition-all hover:bg-slate-800 active:scale-95 shadow-xl shadow-slate-100 flex items-center justify-center gap-2"
              >
                {isPayoutRequesting ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : (
                  <>
                    <HiOutlineCheckCircle className="w-4 h-4" />
                    Commit Transfer
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-full rounded-2xl bg-slate-50 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
              >
                 Abort Request
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardContainer>
  );
};

export default VendorPayouts;
