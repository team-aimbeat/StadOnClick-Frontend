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



const AdminDashboard: React.FC = () => {

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

            {/* Bookings Trend Chart */}
            <div  className="grid lg:grid-cols-2 gap-4">
                    <ChartCard
          data={bookingsData}
          height={180}
          primaryColor="#8789FF"
          secondaryColor="#C8CFFF"
          barWidth={16}
          gap={8}
          primaryLabel="Current Week"
          secondaryLabel="Last Week"
          showValues={false}
          showLegend={true}
        />
          {/* Content Section */}
      <div className="grid   gap-6">
        {/* Recent Activities */}
        <RecentActivities
          title="Recent activities"
          activities={recentActivities}
        />
        </div>
          
            </div>
 
 
<div >
  <Mapcity/>
</div>

  
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        <GmvCard
          title="GMV today"
          value={124560}
          percentage={1.01}
          periodLabel="last month"
          trend="up"
          showChart={true}
          chartData={gmvChartData}
        />

        <CustomerAcquisitionCard/>
        <VendorsOverview/>
        </div>


<div className='grid grid-cols-2 lg:grid-cols-3 gap-6'>
  <AIAlertInsights/><NewSubscriptionsCard/>
</div>
  
    </div>
  );
};

export default AdminDashboard;
