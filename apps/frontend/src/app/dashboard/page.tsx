'use client';

import { useState } from 'react';
import Tabs from '@/components/ui/Tabs';
import MyListingsTab from './MyListingsTab';
import MyBookingsTab from './MyBookingsTab';
import MyDealsTab from './MyDealsTab';
import AnalyticsTab from './AnalyticsTab';

const dashboardTabs = [
  { key: 'listings', label: 'My Listings' },
  { key: 'bookings', label: 'My Bookings' },
  { key: 'deals', label: 'My Deals' },
  { key: 'analytics', label: 'Analytics' },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('listings');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your listings, bookings, and deals</p>
      </div>

      <Tabs tabs={dashboardTabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'listings' && <MyListingsTab />}
        {activeTab === 'bookings' && <MyBookingsTab />}
        {activeTab === 'deals' && <MyDealsTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
      </div>
    </div>
  );
}
