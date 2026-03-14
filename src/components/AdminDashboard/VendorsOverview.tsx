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
  <div className="rounded-xl border border-slate-200 bg-white px-4 py-4">
  <div className="flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-slate-700">{name}</p>
      <div className="mt-2">
        <div className="text-3xl font-semibold text-slate-900">{count}</div>
        <div className="text-xs text-slate-500">Vendors</div>
      </div>
    </div>

    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700">
      <Icon className="h-5 w-5" />
    </div>
  </div>

  <div className={`mt-3 flex items-center gap-1 text-xs font-medium ${color}`}>
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

  return (
    <div className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Top Selling Vendor Services</h3>
          <p className="text-xs text-slate-500">Distribution by category</p>
        </div>
        <span className="text-xs font-semibold text-slate-600">Total vendors: {totalVendors}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {categories.map((category) => (
          <VendorCategoryItem key={category.name} category={category} />
        ))}
      </div>
    </div>
  );
};

export default VendorsOverview;
