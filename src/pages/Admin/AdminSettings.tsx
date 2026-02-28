import React, { useState, useEffect } from "react";
import { 
  useGetSettingsQuery, 
  useUpdateSettingsMutation 
} from "@/services/adminSettingsApi";
import { 
  IconPercentage, 
  IconInfoCircle, 
  IconDeviceFloppy, 
  IconCalculator,
  IconAlertCircle,
  IconCheck
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const AdminSettings: React.FC = () => {
  const { data: settings, isLoading, isError } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();

  const [commissionRate, setCommissionRate] = useState<number>(0.1);
  const [sampleAmount, setSampleAmount] = useState<number>(100);

  useEffect(() => {
    if (settings?.PLATFORM_COMMISSION_RATE !== undefined) {
      setCommissionRate(settings.PLATFORM_COMMISSION_RATE);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings({ PLATFORM_COMMISSION_RATE: commissionRate }).unwrap();
      toast.success("Platform settings updated successfully!");
    } catch (err) {
      toast.error("Failed to update settings. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-xl border border-red-100">
        <IconAlertCircle className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-red-900 mb-2">Failed to Load Settings</h2>
        <p className="text-red-700">We couldn't connect to the settings service. Please refresh the page.</p>
      </div>
    );
  }

  // Calculator Logic
  const platformFee = sampleAmount * commissionRate;
  const vendorPayout = sampleAmount - platformFee;

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header Section */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <IconPercentage size={24} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
        </div>
        <p className="text-gray-500 max-w-2xl">
          Configure core marketplace parameters. Changes made here affect all future transactions across the platform.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Configuration Panel */}
        <section className="lg:col-span-7 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-6 text-lg font-semibold text-gray-800">
              <IconDeviceFloppy size={20} className="text-primary" />
              <h2>Commission Configuration</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Global Platform Commission Rate
                </label>
                <div className="relative group">
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    max="1"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-lg font-medium"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                    {(commissionRate * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="mt-3 flex items-start gap-2 p-3 bg-blue-50/50 rounded-lg text-blue-700 text-sm italic">
                  <IconInfoCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <p>A value of 0.1 represents a 10% commission. The maximum allowed is 1.0 (100%).</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50">
                <button 
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isUpdating ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <IconCheck size={20} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 text-amber-900">
            <div className="flex gap-3">
              <IconAlertCircle className="text-amber-500 flex-shrink-0" />
              <div>
                <h4 className="font-bold mb-1">Important Note</h4>
                <p className="text-sm opacity-90 leading-relaxed">
                  Changing the commission rate will <strong>not</strong> retroactively update existing orders. It only applies to new bookings created after the change is saved.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Visual Preview / Calculator */}
        <aside className="lg:col-span-5">
          <div className="bg-gray-900 text-white p-8 rounded-2xl shadow-xl sticky top-6 overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-8 opacity-80">
                <IconCalculator size={20} />
                <span className="text-sm font-semibold tracking-wider uppercase">Live Revenue Preview</span>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Sample Order Value</label>
                  <div className="flex items-end gap-2 text-4xl font-bold">
                    <span className="text-gray-500 font-light text-2xl">SEK</span>
                    <input 
                      type="number"
                      value={sampleAmount}
                      onChange={(e) => setSampleAmount(parseFloat(e.target.value))}
                      className="bg-transparent border-b border-gray-700 focus:border-primary outline-none w-full pb-1 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-gray-800">
                  <div className="flex justify-between items-center group">
                    <span className="text-gray-400 group-hover:text-white transition-colors">Platform Fee ({(commissionRate * 100).toFixed(0)}%)</span>
                    <motion.span 
                      key={platformFee}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-primary font-bold"
                    >
                      + SEK {platformFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </motion.span>
                  </div>
                  
                  <div className="flex justify-between items-center group">
                    <span className="text-gray-400 group-hover:text-white transition-colors">Net Vendor Payout</span>
                    <motion.span 
                       key={vendorPayout}
                       initial={{ opacity: 0, y: -10 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="text-white font-bold"
                    >
                      SEK {vendorPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </motion.span>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500 italic">Expected Profit Margin</div>
                    <div className="text-xl font-black text-primary">{(commissionRate * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AdminSettings;
