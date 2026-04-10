import {
  HiOutlineBuildingStorefront,
  HiOutlineHeart,
  HiOutlineTicket,
  HiOutlineShoppingCart,
  HiMiniCake,
  HiMiniArrowUp,
  HiMiniArrowDown,
  HiMiniMinus,
} from "react-icons/hi2";

type Trend = "up" | "down" | "neutral";

type VendorCategory = {
  name: string;
  count: number;
  trend: Trend;
  delta: string;
  icon: React.ComponentType<{ className?: string }>;
};

const defaultVendorCategories: VendorCategory[] = [
  { name: "Cafe", count: 334, trend: "up", delta: "+12%", icon: HiOutlineBuildingStorefront },
  { name: "Wellness", count: 145, trend: "up", delta: "+8%", icon: HiOutlineHeart },
  { name: "Events", count: 53, trend: "down", delta: "-2%", icon: HiOutlineTicket },
  { name: "Baking", count: 33, trend: "neutral", delta: "0%", icon: HiMiniCake },
  { name: "Wedding", count: 44, trend: "up", delta: "+5%", icon: HiOutlineBuildingStorefront },
  { name: "Shop", count: 12, trend: "neutral", delta: "0%", icon: HiOutlineShoppingCart },
];

const trendConfig: Record<
  Trend,
  { color: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  up: { color: "text-emerald-700", Icon: HiMiniArrowUp },
  down: { color: "text-rose-700", Icon: HiMiniArrowDown },
  neutral: { color: "text-slate-600", Icon: HiMiniMinus },
};

const VendorCategoryItem = ({ category }: { category: VendorCategory }) => {
  const { name, count, trend, delta, icon: Icon } = category;
  const { color, Icon: TrendIcon } = trendConfig[trend];

  return (
    <div className="rounded-2xl bg-white/10 px-4 py-3 text-white/95 shadow-[0_10px_24px_-18px_rgba(0,0,0,0.45)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{name}</p>
          <div className="mt-1 flex items-end gap-2">
            <div className="text-xl font-semibold leading-none">{count}</div>
            <div className="pb-[1px] text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75">
              vendors
            </div>
          </div>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white/90">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-3 h-1.5 rounded-full bg-white/15">
        <div
          className="h-full rounded-full bg-white"
          style={{ width: `${Math.max(12, Math.min(100, (count / 380) * 100))}%` }}
        />
      </div>

      <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${color}`}>
        <TrendIcon className="h-3.5 w-3.5" />
        <span>{delta} vs last month</span>
      </div>
    </div>
  );
};


type VendorsOverviewProps = {
  categories?: VendorCategory[];
};

const VendorsOverview = ({ categories = defaultVendorCategories }: VendorsOverviewProps) => {
  const totalVendors = categories.reduce((sum, item) => sum + item.count, 0);
  const topCategories = [...categories].sort((a, b) => b.count - a.count).slice(0, 2);
  const topCategory = topCategories[0];
  const secondCategory = topCategories[1];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-[#4F7DFF] p-5 text-white ">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/70">
            Top Selling
          </div>
          <h3 className="mt-1 text-xl font-semibold leading-tight text-white">
            Top Selling Vendor Services
          </h3>
      
        </div>
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/80">
          {totalVendors.toLocaleString()} total
        </span>
      </div>

      <div className="mt-auto space-y-3">
        {topCategory ? <VendorCategoryItem category={topCategory} /> : null}
        {secondCategory ? <VendorCategoryItem category={secondCategory} /> : null}
      </div>
    </div>
  );
};

export default VendorsOverview;
