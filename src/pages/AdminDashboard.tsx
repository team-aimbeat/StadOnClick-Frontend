import Breadcrumb from '@/components/shared/Breadcrumb';
import StatCard from '@/components/shared/StatCard';
import ChartCard, { bookingsData } from '@/components/AdminDashboard/ChartCard';
import GmvCard, { gmvChartData } from '@/components/AdminDashboard/GmvChartCard';
import RecentActivities, { recentActivities } from '@/components/AdminDashboard/RecentActivities';
import React, { useEffect, useState } from 'react';
import {
  HiOutlineShoppingBag,
  HiOutlineChartBar,
  HiOutlineUserGroup,
  HiOutlineUser,
} from 'react-icons/hi2';
import Mapcity from '@/components/AdminDashboard/Mapcity';
import CustomerAcquisitionCard from '@/components/AdminDashboard/CustomerAcquisitionCard';
import VendorsOverview from '@/components/AdminDashboard/VendorsOverview';
import AIAlertInsights from '@/components/AdminDashboard/AIAlertInsights';
import AdminDashboardSkeleton from '@/components/skeletons/AdminDashboardSkeleton';
import NewSubscriptionsCard from '@/components/AdminDashboard/NewSubscriptionsCard.';
import actionImg from '@/assets/images/action.png';
import spaImg from '@/assets/images/spa.png';
import bakeryImg from '@/assets/images/bakery.png';
import viewImg from '@/assets/images/view.png';
import documentImg from '@/assets/images/document.png';

const AdminDashboard: React.FC = () => {
  const popularProducts = [
    { id: 1, name: 'Crypter - NFT UI Kit', price: '$3,250.00', status: 'Active', image: actionImg },
    { id: 2, name: 'Bento Pro 2.0 Illustrations', price: '$7,890.00', status: 'Active', image: spaImg },
    { id: 3, name: 'Fleet - Travel Shopping Kit', price: '$1,500.00', status: 'Offline', image: bakeryImg },
    { id: 4, name: 'SimpleSocial UI Design Kit', price: '$9,999.99', status: 'Active', image: viewImg },
    { id: 5, name: 'Bento Pro vol. 2', price: '$4,750.00', status: 'Active', image: documentImg },
  ];

  const comments = [
    {
      id: 1,
      author: 'Jimmy Andersson',
      role: 'Design Lead',
      time: '2 hours ago',
      text: 'Hey guys, I have updated the wireframe!',
      avatar: 'https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?auto=format&fit=crop&w=80&q=80',
    },
    {
      id: 2,
      author: 'Gladys Smith',
      role: 'Product Manager',
      time: 'Yesterday',
      text: 'Looks good! Let\'s align on the copy tonight.',
      avatar: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=80&q=80',
    },
    {
      id: 3,
      author: 'Dash Miller',
      role: 'Engagement Head',
      time: '2 days ago',
      text: 'Can we loop in the marketing team for the next release?',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80',
    },
  ];

  const quickMetrics = [
    { title: "Today's orders", value: 9934, percentage: 6.3, trend: 'up', icon: HiOutlineShoppingBag, accentColor: 'blue', subtitle: "Today's Orders" },
    { title: 'Active vel today', value: 3812, percentage: 50, trend: 'down', icon: HiOutlineChartBar, accentColor: 'purple', subtitle: 'Active Visits Today' },
    { title: 'Active customers today', value: 132, percentage: 132, trend: 'up', icon: HiOutlineUserGroup, accentColor: 'green', subtitle: 'Active Customers Today' },
    { title: 'Active users today', value: 132, percentage: 132, trend: 'down', icon: HiOutlineUserGroup, accentColor: 'yellow', subtitle: 'Active Users Today' },
    { title: 'New users today', value: 132, percentage: 120, trend: 'up', icon: HiOutlineUser, accentColor: 'red', subtitle: 'New Users Today' },
  ];

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <AdminDashboardSkeleton />;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full space-y-6 px-4 lg:px-2">
        <div className="rounded-[28px] w-[300px] border border-slate-200 bg-white p-5 shadow-sm">
          <Breadcrumb />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {quickMetrics.map((metric) => (
            <StatCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              percentage={metric.percentage}
           
              icon={metric.icon}
              accentColor={metric.accentColor as any}
              subtitle={metric.subtitle}
            />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <div className="space-y-6 rounded-[28px] border border-slate-100 bg-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">Overview</h2>
                <button className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">Last month</button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Customers</p>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <p className="text-4xl font-semibold text-blue-600">1,293</p>
                      <p className="text-sm text-slate-500">vs last month</p>
                    </div>
                    <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600">-3.6%</span>
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Balance</p>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <p className="text-4xl font-semibold text-blue-600">256k</p>
                      <p className="text-sm text-slate-500">vs last month</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">+3.8%</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">857 new customers today!</p>
                <p className="text-sm text-slate-500">Send a welcome message to all new customers.</p>
                <div className="mt-4 flex items-center gap-4 text-sm text-slate-700">
                  {recentActivities.slice(0, 4).map((customer) => (
                    <div key={customer.id} className="flex flex-col items-center gap-2">
                      <img
                        src={customer.avatar}
                        alt={customer.name}
                        className="h-12 w-12 rounded-full border border-slate-200 object-cover"
                      />
                      <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-600 border border-sky-100">
                        {customer.name}
                      </span>
                    </div>
                  ))}
                  <button className="rounded-full border border-slate-200 px-4 py-1 text-xs font-medium text-slate-600">View all →</button>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-100 bg-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">Product view</h2>
                <button className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">Last 7 days</button>
              </div>
              <div className="mt-6">
                <ChartCard
                  data={bookingsData}
                  height={220}
                  primaryColor="#22c55e"
                  secondaryColor="#c6f6d5"
                  primaryLabel="Current Week"
                  secondaryLabel="Last Week"
                  showLegend={false}
                />
              </div>
            </div>

<div className='grid grid-cols-1  lg:grid-cols-2'>  <Mapcity />   <RecentActivities title="Recent activities" activities={recentActivities} />
</div>
      

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <GmvCard
                title="GMV today"
                value={124560}
                percentage={1.01}
                periodLabel="last month"
                trend="up"
                showChart
                chartData={gmvChartData}
              />
              <CustomerAcquisitionCard />
              <VendorsOverview />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <AIAlertInsights />
              
              <NewSubscriptionsCard />
              
      
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">Popular products</h2>
                <span className="text-xs text-slate-500">All products</span>
              </div>
              <div className="mt-4 space-y-4">
                {popularProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 p-4">
                    <div className="h-12 w-12 overflow-hidden rounded-2xl bg-slate-100">
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.price}</p>
                    </div>
                    <span className={`text-xs font-semibold ${product.status === 'Active' ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {product.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-6 border-b border-slate-100 pb-4">
                <button className="text-sm font-semibold text-slate-900 border-b-2 border-slate-900 pb-2">Comments</button>
              </div>
              <div className="mt-4 space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-4 rounded-2xl border border-slate-100 p-4">
                    <div className="h-12 w-12 overflow-hidden rounded-full border border-slate-200">
                      <img
                        src={comment.avatar}
                        alt={comment.author}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{comment.author}</p>
                          <p className="text-xs text-slate-500">{comment.role}</p>
                        </div>
                        <span className="text-xs text-slate-400">{comment.time}</span>
                      </div>
                      <p className="text-sm text-slate-700">{comment.text}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5">??</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5">?? Reply</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
        </div> 
      </div>
    </div>
  );
};

export default AdminDashboard;
