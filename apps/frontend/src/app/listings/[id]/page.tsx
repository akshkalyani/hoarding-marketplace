'use client';

import { useParams, useRouter } from 'next/navigation';
import { useListing } from '@/hooks/useListings';
import { useStartListingConversation } from '@/hooks/useChat';
import { useAuthStore } from '@/stores/authStore';
import { useDealStore } from '@/stores/dealStore';
import ListingGallery from '@/components/ListingGallery';
import MapPicker from '@/components/ui/MapPicker';
import Calendar from '@/components/ui/Calendar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { LISTING_TYPES, LISTING_STATUS_LABELS } from '@/lib/types';
import type { Booking, ListingStatus } from '@/lib/types';

const statusBadge: Record<ListingStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  DRAFT: 'default',
  PENDING: 'warning',
  APPROVED: 'info',
  LIVE: 'success',
  REJECTED: 'danger',
};

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: listing, isLoading } = useListing(id);
  const user = useAuthStore((s) => s.user);
  const addItem = useDealStore((s) => s.addItem);
  const items = useDealStore((s) => s.items);
  const startConversation = useStartListingConversation();

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-red-600">Listing not found.</p>
      </div>
    );
  }

  const typeLabel = LISTING_TYPES.find((t) => t.value === listing.type)?.label || listing.type;
  const bookedRanges = (listing.bookings || []).map((b: Booking) => ({
    start: new Date(b.startDate),
    end: new Date(b.endDate),
  }));
  const isInDeal = items.some((i) => i.listing.id === listing.id);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
                <p className="text-sm text-gray-500 mt-1">by {listing.owner?.name || 'Media Owner'}</p>
              </div>
              <Badge variant={statusBadge[listing.status]}>
                {LISTING_STATUS_LABELS[listing.status]}
              </Badge>
            </div>

            {listing.isFeatured && (
              <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 font-medium">
                ⭐ Featured Listing
              </div>
            )}
          </div>

          <ListingGallery images={listing.images || []} />

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Location</h2>
            <MapPicker value={{ lat: listing.latitude, lng: listing.longitude }} onChange={() => {}} readOnly />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Availability</h2>
            <Calendar bookedRanges={bookedRanges} readOnly />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              ₹{listing.price.toLocaleString()}<span className="text-sm font-normal text-gray-500">/month</span>
            </div>

            <div className="space-y-3 mt-4 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Type</span>
                <span className="font-medium">{typeLabel}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Location</span>
                <span className="font-medium font-mono text-xs">
                  {listing.latitude.toFixed(4)}, {listing.longitude.toFixed(4)}
                </span>
              </div>
              {listing.landmarks?.length > 0 && (
                <div className="py-2 border-b border-gray-100">
                  <span className="text-gray-500 block mb-2">Landmarks</span>
                  <div className="flex flex-wrap gap-1">
                    {listing.landmarks.map((l, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 rounded text-xs">{l}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-2">
              <Button
                className="w-full"
                onClick={() => addItem(listing)}
                disabled={isInDeal}
              >
                {isInDeal ? '✓ In Deal Cart' : '+ Add to Deal'}
              </Button>
              {user && listing.ownerId !== user.id && (
                <Button
                  variant="secondary"
                  className="w-full"
                  loading={startConversation.isPending}
                  onClick={async () => {
                    const conv = await startConversation.mutateAsync(listing.id);
                    router.push(`/chat?conversation=${conv.id}`);
                  }}
                >
                  💬 Contact Owner
                </Button>
              )}
              {items.length > 0 && (
                <a href="/deals">
                  <Button variant="secondary" className="w-full">
                    View Deal Cart ({items.length})
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
