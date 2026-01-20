import { useEffect, useMemo, useState } from "react";
import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useAppDispatch } from "@/app/hooks";
import { useMockLoader } from "@/lib/useMockLoader";

type Transaction = {
  id: string;
  type: "booking" | "refund" | "commission" | "adjustment";
  label: string;
  amount: number;
  date: string;
  status: "completed" | "pending";
};

const transactionsSeed: Transaction[] = [
  {
    id: "TX-981",
    type: "booking",
    label: "AC Service & Gas Refill",
    amount: 7200,
    date: "2025-01-20",
    status: "completed",
  },
  {
    id: "TX-982",
    type: "refund",
    label: "Refund - Meera Nair",
    amount: -1800,
    date: "2025-01-18",
    status: "completed",
  },
  {
    id: "TX-983",
    type: "commission",
    label: "Market commission",
    amount: -1200,
    date: "2025-01-17",
    status: "completed",
  },
  {
    id: "TX-984",
    type: "booking",
    label: "Deep Cleaning - 2BHK",
    amount: 8800,
    date: "2025-01-16",
    status: "pending",
  },
  {
    id: "TX-985",
    type: "adjustment",
    label: "Manual adjustment",
    amount: 500,
    date: "2025-01-15",
    status: "completed",
  },
];

const VendorWallet = () => {
  const dispatch = useAppDispatch();
  const loading = useMockLoader();
  const [filters, setFilters] = useState({
    type: "all",
    date: "all",
  });
  const [balance] = useState(48200);

  useEffect(() => {
    dispatch(setPageTitle("Wallet"));
  }, [dispatch]);

  const filteredTransactions = useMemo(
    () =>
      transactionsSeed.filter((tx) => {
        if (filters.type !== "all" && tx.type !== filters.type) {
          return false;
        }
        if (filters.date === "30" && new Date(tx.date) < new Date("2024-12-20")) {
          return false;
        }
        if (filters.date === "7" && new Date(tx.date) < new Date("2025-01-13")) {
          return false;
        }
        return true;
      }),
    [filters]
  );

  if (loading) {
    return (
      <DashboardContainer className="space-y-4 pt-8">
        <div className="h-8 w-1/3 animate-pulse rounded-full bg-slate-200" />
        <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4">
          <div className="h-8 w-20 animate-pulse rounded-full bg-slate-200" />
          <div className="mt-3 space-y-2">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="h-6 rounded-lg bg-slate-200" />
            ))}
          </div>
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer className="space-y-5 pb-10">
      <TitleBreadCrumbs title="Wallet" breadCrumbTitle="Vendor / Wallet" />

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Balance</p>
        <p className="text-3xl font-semibold text-slate-900">₹{balance.toLocaleString("en-IN")}</p>
        <p className="text-xs text-slate-500">
          Incoming payouts will reflect here once confirmed. Withdraws go to payouts queue.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-2">
          <span>Type</span>
          <select
            value={filters.type}
            onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}
            className="rounded-full border border-slate-200 px-3 py-1 text-[11px]"
          >
            <option value="all">All</option>
            <option value="booking">Bookings</option>
            <option value="refund">Refunds</option>
            <option value="commission">Commission</option>
            <option value="adjustment">Adjustments</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span>Date</span>
          <select
            value={filters.date}
            onChange={(event) => setFilters((prev) => ({ ...prev, date: event.target.value }))}
            className="rounded-full border border-slate-200 px-3 py-1 text-[11px]"
          >
            <option value="all">All time</option>
            <option value="30">Last 30 days</option>
            <option value="7">Last 7 days</option>
          </select>
        </div>
        <button
          type="button"
          onClick={() => alert("Export ready - mocked")}
          className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-600"
        >
          Export transactions
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="px-4 py-3 text-xs uppercase tracking-[0.3em] text-slate-400">
          Transactions
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-4 py-3 font-semibold text-slate-900">{tx.id}</td>
                  <td className="px-4 py-3">{tx.label}</td>
                  <td className="px-4 py-3 capitalize text-slate-700">{tx.type}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {tx.amount < 0 ? "-" : ""}
                    ₹{Math.abs(tx.amount).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3">{tx.date}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        tx.status === "completed"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!filteredTransactions.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-xs text-slate-500">
                    No transactions match current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardContainer>
  );
};

export default VendorWallet;
