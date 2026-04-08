'use client';

import { useMyBookings } from '@/hooks/useAdmin';
import Calendar from '@/components/ui/Calendar';
import Badge from '@/components/ui/Badge';
import type { Booking } from '@/lib/types';
import { format } from 'date-fns';

export default function MyBookingsTab() {
  const { data: bookings, isLoading } = useMyBookings();

  const bookedRanges = (bookings || []).map((b: Booking) => ({
    start: new Date(b.startDate),
    end: new Date(b.endDate),
  }));

  if (isLoading) {
    return <div className="text-gray-500">Loading your bookings...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Booking Calendar</h3>
        <Calendar bookedRanges={bookedRanges} readOnly />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Upcoming Bookings</h3>
        {!bookings?.length ? (
          <p className="text-sm text-gray-500">No bookings yet.</p>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking: Booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div>
                  <p className="font-medium text-sm">{booking.listing?.title || 'Listing'}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(booking.startDate), 'MMM d, yyyy')} —{' '}
                    {format(new Date(booking.endDate), 'MMM d, yyyy')}
                  </p>
                </div>
                <Badge variant="success">Booked</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
