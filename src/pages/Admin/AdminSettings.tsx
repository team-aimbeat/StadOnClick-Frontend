import React, { useState, useEffect } from "react";
import { useGetSettingsQuery, useUpdateSettingsMutation } from "@/services/adminSettingsApi";
import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  HiOutlineUser,
  HiOutlineBuildingOffice2,
  HiOutlineBriefcase,
  HiOutlineArrowRight,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineArrowPath,
  HiOutlineInformationCircle,
} from "react-icons/hi2";

/* ─── Animated moving dot along a horizontal track ─── */
function TravelDot({ color = "bg-slate-900", delay = 0, totalDuration = 3.2 }: { color?: string, delay?: number, totalDuration?: number }) {
  return (
    <motion.span
      className={`absolute top-1/2 -translate-y-1/2 h-2 w-2 rounded-full ${color}`}
      initial={{ left: "0%", opacity: 0 }}
      animate={{ left: ["0%", "95%", "95%"], opacity: [0, 1, 0] }}
      transition={{ 
        duration: 1.6, 
        ease: "easeInOut", 
        repeat: Infinity, 
        repeatDelay: totalDuration - 1.6, // Wait for the other phase
        delay: delay // Offset start time
      }}
    />
  );
}

/* ─── Flow node card ─── */
function FlowNode({
  icon: Icon,
  label,
  sublabel,
  value,
  accent = false,
}: {
  icon: React.ElementType;
  label: string;
  sublabel: string;
  value?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-2 px-5 py-4 rounded-lg border min-w-[110px] ${
        accent
          ? "bg-slate-950 border-slate-800"
          : "bg-white border-slate-200"
      }`}
    >
      <div
        className={`h-9 w-9 rounded-lg flex items-center justify-center ${
          accent ? "bg-slate-800 text-white" : "bg-slate-100 border border-slate-200 text-slate-600"
        }`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-center">
        <p className={`text-[10px] font-black uppercase tracking-widest ${accent ? "text-slate-400" : "text-slate-500"}`}>
          {label}
        </p>
        <p className={`text-[9px] font-medium mt-0.5 ${accent ? "text-slate-500" : "text-slate-400"}`}>
          {sublabel}
        </p>
        {value && (
          <p className={`text-sm font-black mt-1 tracking-tight ${accent ? "text-white" : "text-slate-900"}`}>
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Arrow connector with animated dot ─── */
function FlowConnector({
  label,
  dotColor,
  delay = 0,
}: {
  label?: string;
  dotColor?: string;
  delay?: number;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-1 min-w-[60px]">
      <div className="relative w-full h-px bg-slate-200 overflow-visible">
        <TravelDot color={dotColor} delay={delay} />
        <HiOutlineArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
      </div>
      {label && (
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
          {label}
        </span>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════════════════════ */
const AdminSettings: React.FC = () => {
  const { data: settings, isLoading, isError } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();

  const [commissionRate, setCommissionRate] = useState<number>(0.1);
  const [sampleAmount, setSampleAmount] = useState<number>(1000);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (settings?.PLATFORM_COMMISSION_RATE !== undefined) {
      setCommissionRate(settings.PLATFORM_COMMISSION_RATE);
    }
  }, [settings]);

  const handleSave = async () => {
    if (commissionRate < 0 || commissionRate > 1) {
      toast.error("Rate must be between 0 and 1.");
      return;
    }
    try {
      await updateSettings({ PLATFORM_COMMISSION_RATE: commissionRate }).unwrap();
      toast.success("Commission rate saved.");
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
    } catch {
      toast.error("Failed to save. Please try again.");
    }
  };

  const platformFee = sampleAmount * commissionRate;
  const vendorPayout = sampleAmount - platformFee;
  const pct = (commissionRate * 100).toFixed(1);


  if (isError) {
    return (
      <DashboardContainer>
        <div className="flex items-center gap-3 p-6 bg-rose-50 border border-rose-200 rounded-lg text-rose-700">
          <HiOutlineExclamationTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-semibold">Failed to load settings. Please refresh the page.</p>
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer className="space-y-8 pb-12">
      {/* ── Header ── */}
      <TitleBreadCrumbs
        title="Platform Settings"
        breadCrumbTitle="Admin / Platform Settings"
      />

      {/* ──────────────────────────────────────
          TOP ROW: Configuration & Breakdown (50/50 Split)
      ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* --- LEFT: Commission Rate --- */}
        <div className="flex flex-col gap-6 h-full">
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden flex-1 flex flex-col">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
              <div className="h-8 w-8 rounded-lg bg-slate-950 flex items-center justify-center text-white flex-shrink-0">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Commission Rate</h2>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide mt-0.5">
                  Global marketplace setting
                </p>
              </div>
              <motion.span
                key={pct}
                initial={{ opacity: 0.4, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="ml-auto text-3xl font-black text-slate-900 tracking-tighter"
              >
                {pct}%
              </motion.span>
            </div>

            <div className="px-6 py-5 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-6">
                {/* Slider */}
                <div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.005}
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-slate-950"
                    style={{
                      background: `linear-gradient(to right, #0f172a ${commissionRate * 100}%, #e2e8f0 ${commissionRate * 100}%)`,
                    }}
                  />
                  <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1.5">
                    <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                  </div>
                </div>

                {/* Inputs Row */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                      Decimal value
                    </label>
                    <input
                      type="number"
                      step="0.005"
                      min="0"
                      max="1"
                      value={commissionRate}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        if (!isNaN(v)) setCommissionRate(Math.min(1, Math.max(0, v)));
                      }}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-all"
                    />
                  </div>
                  <div className="flex-[2]">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                      Quick presets
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[0.05, 0.10, 0.15, 0.20].map((p) => (
                        <button
                          key={p}
                          onClick={() => setCommissionRate(p)}
                          className={`px-3 py-2 rounded-md text-xs font-bold border transition-all ${
                            Math.abs(commissionRate - p) < 0.001
                              ? "bg-slate-950 text-white border-slate-950"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400"
                          }`}
                        >
                          {(p * 100).toFixed(0)}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-black uppercase tracking-[0.15em] bg-slate-950 text-white border border-slate-950 hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none mt-auto"
              >
                <AnimatePresence mode="wait">
                  {isUpdating ? (
                    <motion.span key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                      <HiOutlineArrowPath className="w-3.5 h-3.5 animate-spin" />
                      Saving…
                    </motion.span>
                  ) : justSaved ? (
                    <motion.span key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                      <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                      Saved
                    </motion.span>
                  ) : (
                    <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      Save commission rate
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* --- RIGHT: Revenue Preview --- */}
        <div className="flex flex-col gap-6 h-full">
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden flex-1 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Revenue Breakdown</h2>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide mt-0.5">
                  Live preview — adjust sample order value
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap hidden sm:block">
                  Order value
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">SEK</span>
                  <input
                    type="number"
                    value={sampleAmount}
                    onChange={(e) => setSampleAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="pl-10 pr-3 py-2 w-28 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-5 flex-1 flex flex-col justify-between space-y-6">
              {/* Stat row */}
              <div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50 border border-slate-100 rounded-lg p-4">
                {[
                  { label: "Gross amount", value: `SEK ${sampleAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, sub: "Customer payment" },
                  { label: "Platform earns", value: `SEK ${platformFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, sub: `${pct}% commission` },
                  { label: "Vendor net", value: `SEK ${vendorPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, sub: `${(100 - parseFloat(pct)).toFixed(1)}% payout` },
                ].map((stat, i) => (
                  <div key={stat.label} className={`px-4 ${i === 0 ? "pl-0" : ""} ${i === 2 ? "pr-0" : ""}`}>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                    <motion.p
                      key={stat.value}
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: 1 }}
                      className="text-[13px] sm:text-sm font-black text-slate-900 tracking-tight"
                    >
                      {stat.value}
                    </motion.p>
                    <p className="text-[9px] text-slate-400 mt-0.5 font-medium leading-tight">{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* Visual Bars */}
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <span className="h-2 w-2 rounded-full bg-slate-950 inline-block" /> Platform Split ({pct}%)
                    </span>
                    <span className="text-[10px] font-black text-slate-900">
                      SEK {platformFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <motion.div className="h-full bg-slate-950" animate={{ width: `${commissionRate * 100}%` }} transition={{ duration: 0.4, ease: "easeOut" }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" /> Vendor Split ({(100 - parseFloat(pct)).toFixed(1)}%)
                    </span>
                    <span className="text-[10px] font-black text-emerald-600">
                      SEK {vendorPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <motion.div className="h-full bg-emerald-500" animate={{ width: `${(1 - commissionRate) * 100}%` }} transition={{ duration: 0.4, ease: "easeOut" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────
          MIDDLE ROW: Notices
      ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg h-full">
          <HiOutlineInformationCircle className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Changes apply to <strong className="text-slate-700">new orders only</strong>. Existing orders retain the rate active at the time of booking. The platform extracts commission during the customer payment; the net balance is remitted to the vendor upon payout request.
          </p>
        </div>

        <div className="flex gap-3 p-4 bg-amber-50/50 border border-amber-200/60 rounded-lg h-full">
          <HiOutlineExclamationTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed font-medium">
            High commission rates may directly impact vendor retention and overall marketplace competitiveness. Review carefully before applying changes globally across StadonClick.
          </p>
        </div>
      </div>

      {/* ──────────────────────────────────────
          BOTTOM ROW: Transaction Flow (Full Width Split)
      ────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
          <div className="w-1.5 h-5 bg-slate-900 rounded-full" />
          <h2 className="text-xs font-black uppercase tracking-[0.25em] text-slate-900">Transaction Flow Audit</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 lg:divide-x divide-y lg:divide-y-0 divide-slate-100">
          
          {/* --- Phase 1: Payment --- */}
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phase 1</span>
              <span className="text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 uppercase tracking-wider">
                On order checkout
              </span>
            </div>

            <div className="flex items-center gap-0 w-full">
              <FlowNode icon={HiOutlineUser} label="Customer" sublabel="Initiates payment" />
              <FlowConnector label="Full Amount" dotColor="bg-slate-900" />
              <FlowNode icon={HiOutlineBuildingOffice2} label="StadonClick" sublabel="Receives gross funds" accent />
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">StadonClick Retains</p>
                <p className="text-[9px] font-bold text-slate-500">Platform commission captured instantly</p>
              </div>
              <motion.div key={platformFee + 'p1'} initial={{ opacity: 0.5, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-right">
                <p className="text-sm font-black text-slate-900">SEK {platformFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">({pct}%)</p>
              </motion.div>
            </div>
          </div>

          {/* --- Phase 2: Payout --- */}
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phase 2</span>
              <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 uppercase tracking-wider flex items-center gap-1.5">
                <HiOutlineClock className="w-3.5 h-3.5" />
                Vendor requests payout
              </span>
            </div>

            <div className="flex items-center gap-0 w-full">
              <FlowNode icon={HiOutlineBuildingOffice2} label="StadonClick" sublabel="Releases net balance" accent />
              <FlowConnector label="Net balance" dotColor="bg-emerald-500" delay={1.6} />
              <FlowNode icon={HiOutlineBriefcase} label="Vendor" sublabel="Receives earnings" />
            </div>

            <div className="bg-emerald-50/50 rounded-lg p-4 border border-emerald-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vendor Yield</p>
                <p className="text-[9px] font-bold text-emerald-600/80">Net payout remitted to vendor account</p>
              </div>
              <motion.div key={vendorPayout + 'p2'} initial={{ opacity: 0.5, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-right">
                <p className="text-sm font-black text-emerald-600">SEK {vendorPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">({(100 - parseFloat(pct)).toFixed(1)}%)</p>
              </motion.div>
            </div>
          </div>

        </div>
      </div>
    </DashboardContainer>
  );
};

export default AdminSettings;
