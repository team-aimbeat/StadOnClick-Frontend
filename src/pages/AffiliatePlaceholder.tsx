type AffiliatePlaceholderProps = {
  title: string;
  description?: string;
};

export default function AffiliatePlaceholder({
  title,
  description,
}: AffiliatePlaceholderProps) {
  return (
    <div className="flex min-h-[52vh] items-center justify-center">
      <div className="w-full max-w-2xl space-y-3 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Affiliate workspace
        </p>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-600">
          {description ||
            "This section is ready. Connect API data and actions here next."}
        </p>
      </div>
    </div>
  );
}
