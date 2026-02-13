import { useState } from "react";
import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { 
  useGetPlatformStatsQuery,
  useGetPlatformTransactionsQuery 
} from "@/features/admin/finance/api/adminFinanceApi";
import { 
  HiOutlineGlobeAmericas,
  HiOutlineArrowPath,
  HiOutlineShieldCheck,
  HiOutlineDocumentText,
  HiOutlineArrowTrendingUp
} from "react-icons/hi2";
import { DataTable } from "@/components/shared/DataTable";
import dayjs from "dayjs";
import PlatformWalletSkeleton from "@/components/skeletons/PlatformWalletSkeleton";

const AdminPlatformWalletPage = () => {
  const [page, setPage] = useState(1);
  const { data: statsData, isLoading: isStatsLoading, refetch: refetchStats } = useGetPlatformStatsQuery();
  const { data: txResponse, isLoading: isTxLoading } = useGetPlatformTransactionsQuery({ page, limit: 12 });
  
  const stats = statsData?.data;
  const transactions = txResponse?.data?.data || [];
  const meta = txResponse?.data?.meta;

  const handleRefresh = () => {
    refetchStats();
  };

  if (isStatsLoading && !stats) {
    return <PlatformWalletSkeleton />;
  }

  return (
    <DashboardContainer className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <TitleBreadCrumbs title="Treasury Console" breadCrumbTitle="Finance / Platform Wallet" className="flex-1" />
        <button 
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 transition-all active:scale-95 shrink-0"
        >
          <HiOutlineArrowPath className={`w-3.5 h-3.5 ${isStatsLoading ? 'animate-spin' : ''}`} />
          Sync Treasury
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Treasury Card */}
        <div className="lg:col-span-2">
          <div className="relative overflow-hidden rounded-lg bg-white border border-slate-200 p-10 h-full">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-4 mb-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-600 text-white">
                    <HiOutlineShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Platform Treasury</h3>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-0.5">Verified System Balance</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Available Revenue</label>
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-black text-slate-300">{stats?.currency || 'SEK'}</span>
                      <h1 className="text-7xl font-black tracking-tighter text-slate-900 text-mono-finance">
                        {isStatsLoading ? "---" : stats?.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </h1>
                    </div>
                  </div>

                  <div className="flex flex-col justify-end border-l border-slate-100 pl-12">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pending Liabilities</span>
                        <p className="text-4xl font-black text-slate-900 text-mono-finance">
                          <span className="text-sm text-slate-300 mr-1.5 font-bold">{stats?.currency}</span>
                          {stats?.pendingLiability?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Verified System Audit</span>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-1">Real-time ledger synchronization active</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Side Stats */}
        <div className="space-y-6">
          <div className="finance-card rounded-lg p-8 border border-slate-200 flex flex-col justify-between h-full bg-slate-50/30">
             <div>
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                      <HiOutlineGlobeAmericas className="w-5 h-5" />
                   </div>
                   <h3 className="text-xs font-bold text-slate-900">Total Volume</h3>
                </div>
                <p className="text-3xl font-black text-slate-950 tracking-tighter text-mono-finance">
                   {stats?.currency} {stats?.totalPayouts?.toLocaleString()}
                </p>
                <p className="mt-3 text-[10px] font-medium text-slate-400 leading-relaxed uppercase tracking-wider">
                   Lifetime Platform Revenue Audit
                </p>
             </div>
             
             <div className="mt-8 pt-6 border-t border-slate-200/60">
                <div className="flex items-center justify-between mb-2">
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Ratio</span>
                   <span className="text-[10px] font-bold text-slate-900">5.00%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                   <div className="h-full bg-slate-950 w-[5%]" />
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Transaction Ledger */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-slate-900 rounded-full" />
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900">Revenue Ledger</h2>
           </div>
        </div>

        <DataTable
          title="Revenue Ledger"
          breadCrumbTitle="Finance / Audit"
          data={transactions}
          loading={isTxLoading}
          className="border border-slate-200 rounded-lg overflow-hidden"
          columns={[
            {
              key: "id",
              title: "Reference",
              render: (value: string) => (
                <span className="font-mono text-mono-finance text-[10px] text-slate-400">
                  #{value.slice(0, 10).toUpperCase()}
                </span>
              ),
            },
            {
              key: "vendor",
              title: "Source Merchant",
              render: (_: any, tx: any) => (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-100">
                    <HiOutlineDocumentText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {tx.sourceVendor?.businessName ||
                        tx.wallet?.vendor?.businessName ||
                        "Platform Revenue"}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {tx.sourceVendor?.contactEmail ||
                        tx.wallet?.vendor?.contactEmail ||
                        tx.reference ||
                        tx.type}
                    </p>
                  </div>
                </div>
              ),
            },
            {
              key: "amount",
              title: "Revenue Yield",
              align: "right",
              render: (value: any, tx: any) => {
                const numericAmount = Number(value || 0);
                const isRefund = tx.type === "REFUND";
                return (
                  <div className={`text-right font-black text-base text-mono-finance tracking-tighter ${isRefund ? "text-rose-600" : "text-emerald-600"}`}>
                    {isRefund ? "-" : "+"}
                    {stats?.currency} {numericAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                );
              },
            },
            {
              key: "createdAt",
              title: "Sync Date",
              render: (value: string) => (
                <div>
                  <p className="text-xs font-bold text-slate-600">{dayjs(value).format('DD MMM, YYYY')}</p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{dayjs(value).format('hh:mm A')}</p>
                </div>
              ),
            },
          ]}
          controlledPagination={{
            page: page,
            pageSize: 12,
            totalPages: meta?.totalPages || 1,
            totalRecords: meta?.total || 0,
          }}
          onPaginationChange={({ page: newPage }) => setPage(newPage)}
          selectable={false}
          showSerialNumber={false}
          noRecordText="No revenue records found"
        />
      </div>
    </DashboardContainer>
  );
};

export default AdminPlatformWalletPage;
