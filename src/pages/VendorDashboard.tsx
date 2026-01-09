import Breadcrumb from '@/components/ui/Breadcrumb';
import ChartCard, { bookingsData } from '@/components/AdminDashboard/ChartCard';
import GmvCard, { gmvChartData } from '@/components/AdminDashboard/GmvChartCard';
import RecentActivities, { recentActivities } from '@/components/AdminDashboard/RecentActivities';
import StatCard from '@/components/ui/StatCard';
import React, { useEffect, useState } from 'react';
import {
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineCurrencyDollar,
  HiOutlineShoppingBag,
  HiOutlineUserGroup,
  HiOutlineUser,
  HiOutlineCalendar,
} from 'react-icons/hi2';
import Mapcity from '@/components/AdminDashboard/Mapcity';
import CustomerAcquisitionCard from '@/components/AdminDashboard/CustomerAcquisitionCard';
import VendorsOverview from '@/components/AdminDashboard/VendorsOverview';
import AIAlertInsights from '@/components/AdminDashboard/AIAlertInsights';
import NewSubscriptionsCard from '@/components/AdminDashboard/NewSubscriptionsCard.';
import AdminDashboardSkeleton from '@/components/Layout/skeletons/AdminDashboardSkeleton';
import profile7 from '@/assets/Images/profile-7.jpeg';
import verify from '@/assets/Images/right.png';
import crown from '@/assets/Images/crown.png';



const VendorDashboard: React.FC = () => {

    const [loading, setLoading] = useState(true);
    useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // 2 seconds

    return () => clearTimeout(timer);
  }, []);

  //  SHOW SKELETON FIRST
  if (loading) {
    return <AdminDashboardSkeleton />;
  }


  return (
    <div className="p-6 space-y-6">
      {/* breadcrumb*/}
      <Breadcrumb />

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <img
            src={profile7}
            alt="Vendor profile"
            className="h-15 w-15 rounded-full object-cover"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">
                Saalim Shaikh
              </p>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-green">
                <img src={verify} className='h-5 w-5 inline-block mr-2'></img>
                Verified
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Plumbing services · Malmo
            </p>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-xs font-semibold  shadow-sm transition text-amber-700 hover:bg-amber-300 hover:text-amber-900" >
          <img src={crown} className='h-5 w-7 inline-block mr-2'></img>
          Buy plan
        </button>
      </div>
      
      {/* Page Title */}
      {/* <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        Dashboard
      </h1> */}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-5  gap-4">
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
          trend="up"
          icon={HiOutlineUserGroup}
          accentColor="green"
          subtitle="Active Customer Today"
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

         
  
    </div>
  );
};

export default VendorDashboard;
