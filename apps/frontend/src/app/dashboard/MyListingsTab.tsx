'use client';

import Link from 'next/link';
import { useMyListings, useDeleteListing } from '@/hooks/useListings';
import ListingCard from '@/components/ListingCard';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { LISTING_STATUS_LABELS } from '@/lib/types';
import type { Listing, ListingStatus } from '@/lib/types';

const statusBadge: Record<ListingStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  DRAFT: 'default',
  PENDING: 'warning',
  APPROVED: 'info',
  LIVE: 'success',
  REJECTED: 'danger',
};

export default function MyListingsTab() {
  const { data: listings, isLoading } = useMyListings();
  const deleteListing = useDeleteListing();

  if (isLoading) {
    return <div className="text-gray-500">Loading your listings...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">{listings?.length || 0} listings</p>
        <Link href="/listings/new">
          <Button>+ New Listing</Button>
        </Link>
      </div>

      {!listings?.length ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 mb-4">You haven&apos;t created any listings yet.</p>
          <Link href="/listings/new">
            <Button>Create Your First Listing</Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Title</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Price</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing: Listing) => (
                <tr key={listing.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <Link href={`/listings/${listing.id}`} className="text-blue-600 hover:underline font-medium">
                      {listing.title}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{listing.type}</td>
                  <td className="py-3 px-4 font-medium">₹{listing.price.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <Badge variant={statusBadge[listing.status]}>
                      {LISTING_STATUS_LABELS[listing.status]}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/listings/${listing.id}/edit`}>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          if (confirm('Delete this listing?')) {
                            deleteListing.mutate(listing.id);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
