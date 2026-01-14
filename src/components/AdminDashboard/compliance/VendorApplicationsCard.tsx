import AdminCardShell from "../AdminCardShell";

const VendorApplicationsCard = () => {
  return (
    <AdminCardShell title="Vendor Applications" subtitle="Compliance queue">
      <div className="space-y-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5">
        <p className="text-sm font-semibold text-slate-900">
          Onboarding controls
        </p>
        <p className="text-sm text-slate-600">
          Reserved for application vetting, sanctions checks, and approval workflows.
        </p>
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>Routing</span>
          <span className="font-semibold text-slate-800">
            Pending compliance wiring
          </span>
        </div>
      </div>
    </AdminCardShell>
  );
};

export default VendorApplicationsCard;
