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
  <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:shadow-sm transition">
    {/* Icon */}
    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-700">
      {icon}
    </div>

    {/* Text */}
    <div>
      <div className="text-sm font-medium text-gray-700">
        {title}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-semibold text-gray-900">
          {count}
        </span>
        <span className="text-xs text-gray-500">
          Listed
        </span>
      </div>
    </div>
  </div>
);

const VendorsOverview = () => {
  return (
    <div className="bg-white rounded-2xl p-5 ">
      {/* Header */}
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        Vendors overview
      </h3>

      {/* Grid */}
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
