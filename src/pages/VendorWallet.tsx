import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useAppDispatch } from "@/app/hooks";
import {
  HiOutlineArrowTrendingUp,
  HiOutlineBanknotes,
  HiOutlineClock,
  HiOutlineArrowDownCircle,
  HiOutlineArrowUpCircle,
  HiOutlineReceiptPercent,
  HiOutlineInformationCircle,
  HiOutlineFunnel,
  HiOutlineArrowDownTray,
} from "react-icons/hi2";
import {
  useGetWalletSummaryQuery,
  useGetWalletTransactionsQuery,
  useRequestPayoutMutation,
} from "@/features/vendorWallet/api/walletApi";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import VendorWalletSkeleton from "@/components/skeletons/VendorWalletSkeleton";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const VendorWallet = () => {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [dateRangeLabel, setDateRangeLabel] = useState("");
  const [dateRangeQuery, setDateRangeQuery] = useState<{ fromDate?: string; toDate?: string }>({});
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>();
  const [draftDateRange, setDraftDateRange] = useState<DateRange | undefined>();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    error: summaryError,
  } = useGetWalletSummaryQuery();
  const {
    data: transactionsData,
    isLoading: isTransactionsLoading,
  } = useGetWalletTransactionsQuery({
    page,
    limit: 12,
    fromDate: dateRangeQuery.fromDate,
    toDate: dateRangeQuery.toDate,
  });
  const [requestPayout, { isLoading: isPayoutRequesting }] = useRequestPayoutMutation();

  useEffect(() => {
    dispatch(setPageTitle("Treasury"));
  }, [dispatch]);

  const summary = summaryData?.data;
  const transactions = transactionsData?.data || [];
  const meta = transactionsData?.meta;
  const pageOffset = (page - 1) * 12;

  const formatMoney = (value?: number | string | null) =>
    Number(value ?? 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const sanitizeLedgerText = (value: string) => {
    if (!value) return value;

    return value
      .replace(/ch_[A-Za-z0-9]+/g, (match) => `${match.slice(0, 8)}...`)
      .replace(
        /[0-9a-fA-F]{8,}-[0-9a-fA-F-]{27,}/g,
        (match) => `${match.slice(0, 6)}...${match.slice(-4)}`,
      );
  };

  const extractBookingId = (tx: any) => {
    if (tx.bookingId) {
      return tx.bookingId;
    }

    const rawDescription = typeof tx.description === "string" ? tx.description : "";
    const bookingMatch = rawDescription.match(/booking\s+([0-9a-fA-F]{8,}-[0-9a-fA-F-]{27,})/i);

    return tx.sourceType === "ORDER" ? undefined : bookingMatch?.[1];
  };

  const ledgerRows = transactions.map((tx: any, idx: number) => {
    const rowNumber = pageOffset + idx + 1;
    const bookingId = extractBookingId(tx);
    const cleanedDescription = tx.description
      ? sanitizeLedgerText(tx.description).replace(
          /\s+[0-9a-fA-F]{6}\.\.\.[0-9a-fA-F]{4}$/i,
          "",
        )
      : "Vendor wallet event";

    return {
      ...tx,
      bookingId,
      displayReference: `Txn ${String(rowNumber).padStart(4, "0")}`,
      displayAmount: Number(tx.amount || 0),
      displayDescription: cleanedDescription,
      displayMeta:
        bookingId
          ? "Open booking details"
          : tx.sourceType && tx.sourceId
            ? `${tx.sourceType}: ${sanitizeLedgerText(tx.sourceId)}`
            : tx.sourceType || tx.type,
    };
  });

  const csvExport = useMemo(() => {
    const headers = ["Reference", "Activity", "Settlement", "Timestamp", "Status"];
    const escapeCell = (value: string) => `"${String(value).replace(/"/g, '""')}"`;
    const rows = ledgerRows.map((tx: any) => [
      tx.displayReference,
      tx.displayDescription,
      `${tx.direction === "CREDIT" ? "+" : "-"}${summary?.currency ?? "SEK"} ${formatMoney(tx.displayAmount)}`,
      dayjs(tx.createdAt).format("DD MMM YYYY HH:mm"),
      tx.status,
    ]);

    return [headers, ...rows]
      .map((row) => row.map((cell) => escapeCell(cell)).join(","))
      .join("\n");
  }, [ledgerRows, summary?.currency]);

  const handleExportCsv = () => {
    const blob = new Blob([csvExport], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "treasury-ledger.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const applyDateRange = (range?: DateRange) => {
    const from = range?.from;
    const to = range?.to ?? range?.from;

    if (!from || !to) {
      setSelectedDateRange(undefined);
      setDateRangeLabel("");
      setDateRangeQuery({});
      setPage(1);
      return;
    }

    setSelectedDateRange({ from, to });
    setDateRangeLabel(
      `${dayjs(from).format("DD MMM, YYYY")} - ${dayjs(to).format("DD MMM, YYYY")}`,
    );
    setDateRangeQuery({
      fromDate: dayjs(from).format("YYYY-MM-DD"),
      toDate: dayjs(to).format("YYYY-MM-DD"),
    });
    setPage(1);
  };

  const dateFilterSummary = selectedDateRange?.from
    ? selectedDateRange.to
      ? `${dayjs(selectedDateRange.from).format("DD MMM, YYYY")} to ${dayjs(
          selectedDateRange.to,
        ).format("DD MMM, YYYY")}`
      : dayjs(selectedDateRange.from).format("DD MMM, YYYY")
    : "No filter applied";

  const draftDateFilterSummary = draftDateRange?.from
    ? draftDateRange.to
      ? `${dayjs(draftDateRange.from).format("DD MMM, YYYY")} to ${dayjs(
          draftDateRange.to,
        ).format("DD MMM, YYYY")}`
      : dayjs(draftDateRange.from).format("DD MMM, YYYY")
    : "No filter selected";

  const handlePayoutRequest = async () => {
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid amount sequence");
      return;
    }

    try {
      await requestPayout({ amount }).unwrap();
      toast.success("Settlement request dispatched");
      setIsPayoutModalOpen(false);
      setPayoutAmount("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Protocol rejection");
    }
  };

  const getTransactionIcon = (type: string, direction: string) => {
    if (type === "PAYOUT") {
      return <HiOutlineArrowUpCircle className="w-5 h-5 text-rose-500" />;
    }
    if (type === "PLATFORM_FEE") {
      return <HiOutlineReceiptPercent className="w-5 h-5 text-amber-500" />;
    }
    if (direction === "CREDIT") {
      return <HiOutlineArrowDownCircle className="w-5 h-5 text-emerald-500" />;
    }
    return <HiOutlineArrowTrendingUp className="w-5 h-5 text-indigo-500" />;
  };

  if (isSummaryLoading || isTransactionsLoading) {
    return (
      <DashboardContainer className="space-y-8 pb-12">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
            <div className="h-8 w-48 bg-slate-100 rounded-lg animate-pulse" />
          </div>
          <div className="h-8 w-32 bg-slate-100 rounded-lg animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="finance-card rounded-2xl p-6 border border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
                <div className="h-4 w-4 rounded-full bg-slate-100 animate-pulse" />
              </div>
              <div className="h-10 w-32 bg-slate-100 rounded-lg animate-pulse mb-3" />
              <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-slate-100 rounded-full animate-pulse" />
              <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
          </div>

          <div className="finance-card rounded-2xl overflow-hidden border-slate-100">
            <div className="bg-slate-50/50 border-b border-slate-100 h-12 w-full" />
            <div className="p-0">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-6 py-5 border-b border-slate-50 last:border-0"
                >
                  <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 animate-pulse" />
                    <div className="space-y-1">
                      <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
                      <div className="h-2 w-16 bg-slate-100 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-5 w-24 bg-slate-100 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
                  <div className="h-5 w-20 rounded-full bg-slate-100 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer className="space-y-8 pb-12">
      <div className="space-y-3">
        <TitleBreadCrumbs
          title="Treasury Management"
          breadCrumbTitle="Finance / Wallet"
          className="w-full"
        />
        <div className="flex justify-start md:justify-end">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Status: Operational
          </div>
        </div>
      </div>

      {summaryError && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-100 bg-rose-50/50 p-4 text-[11px] font-bold text-rose-600">
          <HiOutlineInformationCircle className="w-5 h-5" />
          Data synchronization failure. Please re-authenticate or refresh.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="finance-card rounded-[1.5rem] p-6">
          <p className="text-[11px] font-semibold text-slate-500">Liquidity Available</p>
          <div className="mt-2 space-y-1">
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {summary?.currency}
            </p>
            <p className="text-[2rem] font-black tracking-tight text-slate-950">
              {formatMoney(summary?.availableBalance)}
            </p>
          </div>
          <button
            onClick={() => setIsPayoutModalOpen(true)}
            disabled={!summary?.availableBalance || summary.availableBalance <= 0}
            className="mt-6 w-full rounded-xl bg-blue-600 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Initiate Settlement
          </button>
        </div>

        {[
          {
            label: "Locked Funds",
            value: summary?.lockedBalance,
            sub: "No funds currently on hold",
            icon: <HiOutlineClock className="h-3.5 w-3.5" />,
            accent: "text-slate-950",
          },
          {
            label: "Pending Payout",
            value: summary?.pendingPayoutBalance,
            sub: "Estimated settlement in 24h",
            icon: <HiOutlineBanknotes className="h-3.5 w-3.5" />,
            accent: "text-slate-950",
          },
          {
            label: "Historical Volume",
            value: summary?.lifetimeEarnings,
            sub: "+12.5% from last period",
            icon: <HiOutlineArrowTrendingUp className="h-3.5 w-3.5" />,
            accent: "text-emerald-600",
          },
        ].map((item, i) => (
          <div key={i} className="finance-card rounded-[1.5rem] p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                {item.label}
              </p>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                {item.icon}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                {summary?.currency}
              </p>
              <p className={`${item.accent} text-[1.95rem] font-black tracking-tight`}>
                {formatMoney(item.value)}
              </p>
            </div>
            <p className="mt-4 text-[11px] font-medium text-slate-500">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 px-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-6 w-1.5 rounded-full bg-slate-900" />
            <h2 className="text-[1.15rem] font-black tracking-tight text-slate-950">
              Transaction Ledger
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setDraftDateRange(selectedDateRange);
                setIsDatePickerOpen(true);
              }}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
            >
              <HiOutlineFunnel className="h-4 w-4 text-slate-500" />
              Filter
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-100"
            >
              <HiOutlineArrowDownTray className="h-4 w-4 text-slate-500" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="finance-card overflow-hidden rounded-[1.5rem]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-separate border-spacing-0">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                    Reference
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                    Activity
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                    Settlement
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                    Timestamp
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {ledgerRows.length ? (
                  ledgerRows.map((tx: any) => (
                    <tr key={tx.id} className="border-t border-slate-100">
                      <td className="px-6 py-5 align-top">
                        <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-blue-500">
                          {tx.displayReference}
                        </span>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-sm">
                            {getTransactionIcon(tx.type, tx.direction)}
                          </div>
                          <div className="min-w-0">
                            {tx.bookingId ? (
                              <Link
                                to={`/vendor/bookings/${tx.bookingId}`}
                                className="block max-w-[320px] truncate text-[14px] font-black tracking-tight text-slate-950 transition-colors hover:text-blue-600"
                              >
                                {tx.displayDescription}
                              </Link>
                            ) : (
                              <p className="max-w-[320px] text-[14px] font-black tracking-tight text-slate-950">
                                {tx.displayDescription}
                              </p>
                            )}
                            <p className="mt-1 text-[11px] font-medium text-slate-500">
                              {tx.displayMeta}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <span
                          className={cn(
                            "text-[15px] font-black tracking-tight",
                            tx.direction === "CREDIT" ? "text-emerald-600" : "text-rose-600",
                          )}
                        >
                          {tx.direction === "CREDIT" ? "+" : "-"}
                          {summary?.currency} {formatMoney(tx.displayAmount)}
                        </span>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <div>
                          <p className="text-[13px] font-semibold text-slate-700">
                            {dayjs(tx.createdAt).format("DD MMM, YYYY")}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-400">
                            {dayjs(tx.createdAt).format("hh:mm A")}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5 align-top">
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
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <p className="text-sm font-semibold text-slate-500">
                        Zero ledger records registered
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold text-slate-500">
              {meta?.total ?? ledgerRows.length} entries
              {dateRangeLabel ? ` • ${dateRangeLabel}` : ""}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-600 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Prev
              </button>
              <span className="rounded-full bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Page {page} of {meta?.totalPages || 1}
              </span>
              <button
                type="button"
                disabled={page >= (meta?.totalPages || 1)}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-600 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={isDatePickerOpen}
        onOpenChange={(open) => {
          setIsDatePickerOpen(open);
          if (!open) {
            setDraftDateRange(selectedDateRange);
          }
        }}
      >
        <DialogContent className="w-full max-w-[900px] overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-0">
          <DialogHeader className="border-b border-slate-100 px-7 py-6">
            <DialogTitle className="text-2xl font-black tracking-tight text-slate-950">
              Filter Transaction Ledger
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-relaxed text-slate-500">
              Choose a single day or a date range to narrow the treasury ledger.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 px-7 py-6">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  label: "Today",
                  range: { from: new Date(), to: new Date() },
                },
                {
                  label: "Last 7 Days",
                  range: {
                    from: dayjs().subtract(6, "day").toDate(),
                    to: new Date(),
                  },
                },
                {
                  label: "This Month",
                  range: {
                    from: dayjs().startOf("month").toDate(),
                    to: dayjs().endOf("month").toDate(),
                  },
                },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setDraftDateRange(preset.range)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition-all hover:border-slate-300 hover:bg-white"
                >
                  <span className="block text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Preset
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-slate-800">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Selection preview
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-800">
                {draftDateFilterSummary}
              </p>
              <p className="mt-1 text-xs text-slate-500">Applied filter: {dateFilterSummary}</p>
            </div>

            <div className="overflow-x-auto rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_18px_35px_rgba(15,23,42,0.06)]">
              <Calendar
                mode="range"
                selected={draftDateRange}
                defaultMonth={draftDateRange?.from ?? selectedDateRange?.from ?? new Date()}
                onSelect={setDraftDateRange}
                numberOfMonths={1}
                initialFocus
                className="mx-auto"
              />
            </div>
          </div>

          <DialogFooter className="border-t border-slate-100 px-7 py-5">
            <button
              type="button"
              onClick={() => {
                applyDateRange(undefined);
                setDraftDateRange(undefined);
                setIsDatePickerOpen(false);
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-slate-600 transition-all hover:bg-slate-50"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(false)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-slate-700 transition-all hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                applyDateRange(draftDateRange);
                setIsDatePickerOpen(false);
              }}
              disabled={!draftDateRange?.from}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Apply Filter
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/20 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-[2rem] p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-slate-950 tracking-tighter">
              Request Settlement
            </h3>
            <p className="mt-2 text-[11px] text-slate-500 font-medium leading-relaxed mb-8">
              Initiate an external fund transfer to your registered Stripe infrastructure.
              Verified within 24-48 business hours.
            </p>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2 px-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Withdrawal Amount
                  </label>
                  <button
                    onClick={() => setPayoutAmount(summary?.availableBalance?.toString() || "0")}
                    className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-800"
                  >
                    Max Limit
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-300">
                    {summary?.currency}
                  </span>
                  <input
                    type="number"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    placeholder="0.00"
                    className="block w-full finance-input-professional text-3xl text-metric pl-14"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button
                  onClick={handlePayoutRequest}
                  disabled={isPayoutRequesting || !payoutAmount}
                  className="w-full rounded-2xl bg-slate-950 py-5 text-xs font-black text-white uppercase tracking-[0.2em] transition-all hover:bg-slate-800 shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-20 flex items-center justify-center gap-2"
                >
                  {isPayoutRequesting ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Authorize Transfer"
                  )}
                </button>
                <button
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="w-full rounded-2xl bg-slate-50 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
                >
                  Cancel Protocol
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardContainer>
  );
};

export default VendorWallet;
