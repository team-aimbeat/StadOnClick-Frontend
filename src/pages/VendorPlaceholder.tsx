type VendorPlaceholderProps = {
  title: string;
  description?: string;
};

export default function VendorPlaceholder({
  title,
  description,
}: VendorPlaceholderProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-xl space-y-3 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Vendor workspace
        </p>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-600">
          {description ||
            "This section is coming soon. Actions will plug into your vendor workflows."}
        </p>
      </div>
    </div>
  );
}
