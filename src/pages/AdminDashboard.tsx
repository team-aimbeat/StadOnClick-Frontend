import Breadcrumb from '@/components/ui/Breadcrumb';
import ChartCard, { bookingsData } from '@/components/Charts/ChartCard';
import GmvCard, { gmvChartData } from '@/components/Charts/GmvChartCard';
import RecentActivities, { recentActivities } from '@/components/Charts/RecentActivities';
import StatCard from '@/components/ui/StatCard';
import React from 'react';
import {
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineCurrencyDollar,
  HiOutlineShoppingBag,
  HiOutlineUserGroup,
  HiOutlineUser,
  HiOutlineCalendar,
} from 'react-icons/hi2';
import Mapcity from '@/components/Charts/Mapcity';



const AdminDashboard: React.FC = () => {

  const handlePeriodChange = (period: string) => {
    console.log('Period changed to:', period);
    // Fetch new data based on period
  };

  const handleViewReport = () => {
    console.log('View report clicked');
    // Navigate to reports page
  };


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

  
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GmvCard
          title="GMV today"
          value={124560}
          percentage={1.01}
          periodLabel="last month"
          trend="up"
          showChart={true}
          chartData={gmvChartData}
        />
        </div>

      {/* Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Recent Activity
          </h2>
          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <li>• New user registered</li>
            <li>• Monthly report generated</li>
            <li>• Payment received</li>
            <li>• System update completed</li>
          </ul>
        </div>

        {/* Placeholder Chart Area */}
        <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 flex items-center justify-center">
          <span className="text-gray-400 dark:text-gray-500">
            Chart / Graph Area
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
