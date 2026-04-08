'use client';

import { useState } from 'react';
import Tabs from '@/components/ui/Tabs';
import AdminUsersPanel from './AdminUsersPanel';
import AdminListingsPanel from './AdminListingsPanel';

const adminTabs = [
  { key: 'users', label: 'Pending Users' },
  { key: 'listings', label: 'Pending Listings' },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        </div>
        <p className="text-sm text-gray-500">Review and approve pending users and listings</p>
      </div>

      <Tabs tabs={adminTabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'users' && <AdminUsersPanel />}
        {activeTab === 'listings' && <AdminListingsPanel />}
      </div>
    </div>
  );
}
