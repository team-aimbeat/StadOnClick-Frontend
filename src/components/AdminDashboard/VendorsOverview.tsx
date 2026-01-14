import {
  HiOutlineBuildingStorefront,
  HiOutlineHeart,
  HiOutlineTicket,
  HiOutlineShoppingCart,
  HiMiniCake,
} from "react-icons/hi2";

type VendorItemProps = {
  icon: React.ReactNode;
  title: string;
  count: number;
};

const VendorItem = ({ icon, title, count }: VendorItemProps) => (
  <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700">
      {icon}
    </div>

    <div>
      <div className="text-sm font-medium text-slate-700">{title}</div>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-semibold text-slate-900">{count}</span>
        <span className="text-xs text-slate-500">Listed</span>
      </div>
    </div>
  </div>
);

const VendorsOverview = () => {
  return (
    <div className="rounded border border-slate-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">
        Vendors overview
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <VendorItem
          title="Cafe"
          count={334}
    
          icon={<HiOutlineBuildingStorefront className="w-6 h-6 text-secondary-blue" />}
        />
        <VendorItem
          title="Wellness"
          count={45}
          icon={<HiOutlineHeart className="w-6 h-6 text-secondary-blue" />}
        />
        <VendorItem
          title="Events"
          count={53}
          icon={<HiOutlineTicket className="w-6 h-6 text-secondary-blue" />}
        />
        <VendorItem
          title="Baking"
          count={33}
          icon={<HiMiniCake className="w-6 h-6 text-secondary-blue" />}
        />
         <VendorItem
          title="Wedding"
          count={44}
          icon={<HiOutlineBuildingStorefront className="w-6 h-6 text-secondary-blue" />}
        />
        <VendorItem
          title="Shop"
          count={12}
          icon={<HiOutlineShoppingCart className="w-6 h-6 text-secondary-blue" />}
        />
      </div>
    </div>
  );
};

export default VendorsOverview;
