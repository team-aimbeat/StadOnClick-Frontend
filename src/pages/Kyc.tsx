import RecentActivities, {
  recentActivities,
} from "@/components/AdminDashboard/RecentActivities";
import VendorDocumentsTable from "@/components/Layout/columns";
import profile7 from "@/assets/Images/profile-7.jpeg";
import AdminDashboardSkeleton from "@/components/Layout/skeletons/AdminDashboardSkeleton";
import KycSkeleton from "@/components/Layout/skeletons/KycSkeleton";
import Breadcrumb from "@/components/ui/Breadcrumb";
import SearchBar from "@/components/ui/SearchBar";
import StatCard from "@/components/ui/StatCard";
import Table from "@/components/ui/Table";
import { Columns } from "lucide-react";
import { useEffect, useState } from "react";
import {
  HiOutlineChartBar,
  HiOutlineShoppingBag,
  HiOutlineUser,
  HiOutlineUserGroup,
} from "react-icons/hi2";
import { HiEllipsisHorizontal, HiEye, HiCheck, HiXMark } from "react-icons/hi2";

const vendorProfile = {
  name: "Malmo Romokare",
  id: "355657",
  avatar: profile7,
  location: "Malmo",
  verified: true,
};


const Kyc: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // 2 seconds

    return () => clearTimeout(timer);
  }, []);

  //  SHOW SKELETON FIRST
  if (loading) {
    return <KycSkeleton />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* breadcrumb*/}
      <Breadcrumb />

      {/* Page Title */}
      {/* <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        Dashboard
      </h1> */}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-4  gap-4">
        <StatCard
          title="Today's orders"
          value={9934}
          percentage={6.3}
          trend="up"
          icon={HiOutlineShoppingBag}
          accentColor="blue"
          subtitle="Today's Orders"
        />

        <StatCard
          title="Active vel today"
          value={3812}
          percentage={50}
          trend="down"
          icon={HiOutlineChartBar}
          accentColor="purple"
          subtitle="Active visit Today"
        />

        <StatCard
          title="Active customer today"
          value={132}
          percentage={132}
          trend="down"
          icon={HiOutlineUserGroup}
          accentColor="yellow"
          subtitle="Active User Today"
        />

        <StatCard
          title="Active user today"
          value={132}
          percentage={120}
          trend="up"
          icon={HiOutlineUser}
          accentColor="red"
          subtitle="New User Today"
        />
      </div>

      {/* Bookings Trend Chart */}
      <div className="grid lg:grid-cols-1 gap-4">
        {/* Content Section */}
        <div className="p-6">
         <VendorDocumentsTable vendor={vendorProfile} />
        </div>
      </div>
    </div>
  );
};

export default Kyc;
