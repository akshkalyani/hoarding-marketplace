'use client';

import { useDashboardStats } from '@/hooks/useAdmin';
import StatCard from '@/components/ui/StatCard';

export default function AnalyticsTab() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return <div className="text-gray-500">Loading analytics...</div>;
  }

  const s = stats || { totalListings: 0, activeListings: 0, totalBookings: 0, totalDeals: 0, estimatedRevenue: 0 };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Listings" value={s.totalListings} />
        <StatCard label="Active Listings" value={s.activeListings} />
        <StatCard label="Total Bookings" value={s.totalBookings} />
        <StatCard label="Estimated Revenue" value={`₹${s.estimatedRevenue.toLocaleString()}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Total Deals</span>
              <span className="font-medium">{s.totalDeals}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Booking Rate</span>
              <span className="font-medium">
                {s.totalListings > 0 ? Math.round((s.totalBookings / s.totalListings) * 100) : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-500">Avg. Revenue per Listing</span>
              <span className="font-medium">
                ₹{s.totalListings > 0 ? Math.round(s.estimatedRevenue / s.totalListings).toLocaleString() : 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Commission Info</h3>
          <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
            <p className="font-medium mb-1">Current Commission Rate: 5%</p>
            <p>Applies to accounts with fewer than 10 active listings. Commission is tracked internally — all deals are settled offline.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
