import {
  HiOutlineUsers,
  HiOutlineTag,
  HiOutlineRectangleGroup,
} from "react-icons/hi2";
import AdminCardShell from "./AdminCardShell";
import { cn } from "@/lib/utils";
import {
  useGetLeadPlanSubscribersSummaryQuery,
  useListLeadPlansQuery,
  useListVendorSubscriptionsQuery,
} from "@/features/adminLeads/api/adminLeadPlans.api";

const MetricTile = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClassName,
  iconWrapClassName,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
  iconWrapClassName: string;
}) => (
  <div className="flex h-full min-h-[92px] flex-col justify-center gap-1.5 rounded-2xl bg-slate-50 px-3.5 py-3">
    <div className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-sm ${iconWrapClassName}`}>
      <Icon className={`h-4 w-4 ${iconClassName}`} />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <div
        className={cn(
          "truncate font-semibold tracking-[-0.04em] text-[#2F5BEA]",
          typeof value === "number" ? "text-2xl" : "text-sm"
        )}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <p className="text-xs font-medium text-slate-500">{subtitle}</p>
    </div>
  </div>
);

const LeadPlanSubscribersCard = () => {
  const { data: summary } = useGetLeadPlanSubscribersSummaryQuery();
  const { data: subscriptions } = useListVendorSubscriptionsQuery({
    page: 1,
    limit: 1,
    status: "ACTIVE",
  });
  const { data: leadPlans } = useListLeadPlansQuery();

  const subscriberCount = subscriptions?.meta?.total ?? summary?.totalSubscribers ?? 0;
  const leadPlansCount = leadPlans?.length ?? 0;
  const customerPlanName = summary?.mostPopularPlan ?? "N/A";
  const dailyAverage = summary?.dailyAverage ?? 0;

  return (
    <AdminCardShell title="Vendor Subscribers" className="rounded-2xl">
      <div className="grid grid-cols-1 gap-2.5">
        <MetricTile
          title="Subscribers"
          value={subscriberCount}
          subtitle={`${dailyAverage} per day`}
          icon={HiOutlineUsers}
          iconClassName="text-[#3554e0]"
          iconWrapClassName="bg-white text-[#3554e0]"
        />
        <MetricTile
          title="Lead Plans"
          value={leadPlansCount}
          subtitle="active plans"
          icon={HiOutlineTag}
          iconClassName="text-amber-500"
          iconWrapClassName="bg-amber-50 text-amber-500"
        />
        <MetricTile
          title="Customer Plan"
          value={customerPlanName}
          subtitle="most popular"
          icon={HiOutlineRectangleGroup}
          iconClassName="text-emerald-500"
          iconWrapClassName="bg-emerald-50 text-emerald-500"
        />
      </div>
    </AdminCardShell>
  );
};

export default LeadPlanSubscribersCard;
