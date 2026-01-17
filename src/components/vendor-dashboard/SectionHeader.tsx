import { ReactNode } from "react";

type SectionHeaderProps = {
  title: string;
  actions?: ReactNode;
};

export default function SectionHeader({
  title,
  actions,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
