import { useEffect, useState } from "react";
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
} from "react-icons/hi2";
import { CalendarIcon } from "lucide-react";
import {
  useGetWalletSummaryQuery,
  useGetWalletTransactionsQuery,
  useRequestPayoutMutation,
} from "@/features/vendorWallet/api/walletApi";
import { toast } from "react-hot-toast";
import { DataTable } from "@/components/shared/DataTable";
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

  const walletDateControl = (
    <button
      type="button"
      onClick={() => {
        setDraftDateRange(selectedDateRange);
        setIsDatePickerOpen(true);
      }}
      className="flex h-11 min-w-[260px] items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50"
    >
      <span className="flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <CalendarIcon className="h-4 w-4" />
        </span>
        <span className="text-left">
          <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Date filter
          </span>
          <span className="block text-sm font-semibold text-slate-700">
            {dateRangeLabel || "Select range"}
          </span>
        </span>
      </span>
    </button>
  );

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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="finance-card rounded-2xl p-6 relative group overflow-hidden">
          <p className="text-sm font-semibold text-slate-500 mb-1">Liquidity Available</p>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-sm font-medium text-slate-400 mr-1.5">{summary?.currency}</span>
            <p className="text-metric text-4xl tracking-tighter">
              {summary?.availableBalance?.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <button
            onClick={() => setIsPayoutModalOpen(true)}
            disabled={!summary?.availableBalance || summary.availableBalance <= 0}
            className="w-full rounded-xl bg-slate-950 py-3.5 text-[10px] font-black text-white uppercase tracking-widest transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-10"
          >
            Initiate Settlement
          </button>
        </div>

        {[
          {
            label: "Locked Funds",
            value: summary?.lockedBalance,
            color: "text-slate-900",
            icon: <HiOutlineClock className="w-3 h-3" />,
            sub: "Awaiting clearing cycle",
          },
          {
            label: "Pending Payout",
            value: summary?.pendingPayoutBalance,
            color: "text-slate-900",
            icon: <HiOutlineBanknotes className="w-3 h-3" />,
            sub: "Currently being audited",
          },
          {
            label: "Historical Volume",
            value: summary?.lifetimeEarnings,
            color: "text-emerald-600",
            icon: <HiOutlineArrowTrendingUp className="w-3 h-3" />,
            sub: "Total revenue yield",
          },
        ].map((item, i) => (
          <div key={i} className="finance-card rounded-2xl p-6">
            <p className="text-sm font-semibold text-slate-500 mb-1 flex items-center gap-2">
              {item.label}
              {item.icon}
            </p>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-xs font-medium text-slate-300 mr-1">{summary?.currency}</span>
              <p className={`${item.color} text-metric text-3xl tracking-tighter`}>
                {item.value?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 px-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-slate-900 rounded-full" />
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900">
              Transaction Ledger
            </h2>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            {walletDateControl}
            {dateRangeLabel && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Range: {dateRangeLabel}
              </p>
            )}
          </div>
        </div>

        <DataTable
          title="Transaction Ledger"
          breadCrumbTitle="Finance / Ledger"
          data={ledgerRows}
          loading={isTransactionsLoading}
          columns={[
            {
              key: "id",
              title: "Reference",
              render: (_: any, tx: any) => (
                <span className="font-mono text-mono-finance text-[11px] text-slate-400">
                  {tx.displayReference}
                </span>
              ),
            },
            {
              key: "description",
              title: "Activity",
              render: (_: any, tx: any) => (
                <div className="flex items-start gap-3 py-1">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm shrink-0">
                    {getTransactionIcon(tx.type, tx.direction)}
                  </div>
                  <div className="min-w-0 space-y-1.5">
                    {tx.bookingId ? (
                      <>
                        <Link
                          to={`/vendor/bookings/${tx.bookingId}`}
                          className="block max-w-[280px] truncate text-[13px] font-black tracking-tight leading-5 text-slate-900 transition-colors hover:text-indigo-600"
                        >
                          {tx.displayDescription}
                        </Link>
                        <Link
                          to={`/vendor/bookings/${tx.bookingId}`}
                          className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-500 transition-colors hover:text-indigo-700"
                        >
                          View booking
                        </Link>
                      </>
                    ) : (
                      <>
                        <p className="max-w-[280px] text-[13px] font-black text-slate-900 tracking-tight leading-5">
                          {tx.displayDescription}
                        </p>
                        <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">
                          {tx.displayMeta}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ),
            },
            {
              key: "amount",
              title: "Settlement",
              render: (_: any, tx: any) => (
                <div className="text-right font-black text-base text-mono-finance tracking-tighter">
                  <span
                    className={`${
                      tx.direction === "CREDIT" ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {tx.direction === "CREDIT" ? "+" : "-"}
                    <span className="text-[10px] font-medium mr-0.5 opacity-40">
                      {summary?.currency}
                    </span>
                    {tx.displayAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ),
            },
            {
              key: "createdAt",
              title: "Timestamp",
              render: (value: string) => (
                <div>
                  <p className="text-[10px] font-bold text-slate-600">
                    {dayjs(value).format("DD MMM, YYYY")}
                  </p>
                  <p className="text-[9px] font-medium text-slate-400">
                    {dayjs(value).format("hh:mm A")}
                  </p>
                </div>
              ),
            },
            {
              key: "status",
              title: "Status",
              align: "center",
              cellClassName: "align-middle",
              render: (value: string) => (
                <div className="flex items-center justify-center">
                  <span
                    className={`status-indicator ${
                      value === "CONFIRMED"
                        ? "bg-emerald-50 text-emerald-700"
                        : value === "PENDING"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    <span
                      className={`w-1 h-1 rounded-full ${
                        value === "CONFIRMED"
                          ? "bg-emerald-500"
                          : value === "PENDING"
                            ? "bg-amber-500"
                            : "bg-rose-500"
                      }`}
                    />
                    {value}
                  </span>
                </div>
              ),
            },
          ]}
          controlledPagination={{
            page,
            pageSize: 12,
            totalPages: meta?.totalPages || 1,
            totalRecords: meta?.total || 0,
          }}
          onPaginationChange={({ page: newPage }) => setPage(newPage)}
          selectable={false}
          showSerialNumber={false}
          initialHiddenColumns={[]}
          className="finance-card rounded-2xl overflow-hidden shadow-none border-slate-100"
          noRecordText="Zero ledger records registered"
          showDefaultDateControl={false}
        />
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
