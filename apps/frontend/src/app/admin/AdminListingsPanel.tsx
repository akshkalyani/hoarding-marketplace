'use client';

import { useState } from 'react';
import { usePendingListings, useApproveListing, useRejectListing } from '@/hooks/useAdmin';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import type { Listing } from '@/lib/types';
import Link from 'next/link';

export default function AdminListingsPanel() {
  const { data: listings, isLoading } = usePendingListings();
  const approveListing = useApproveListing();
  const rejectListing = useRejectListing();
  const [rejectModal, setRejectModal] = useState<{ id: string; title: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleReject = () => {
    if (!rejectModal) return;
    rejectListing.mutate(
      { id: rejectModal.id, reason: rejectReason || undefined },
      { onSuccess: () => { setRejectModal(null); setRejectReason(''); } }
    );
  };

  if (isLoading) {
    return <div className="text-gray-500">Loading pending listings...</div>;
  }

  if (!listings?.length) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <p className="text-gray-500">No pending listings to review.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-500">Title</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Owner</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Price</th>
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
                <td className="py-3 px-4 text-gray-500">{listing.owner?.name || listing.ownerId}</td>
                <td className="py-3 px-4 text-gray-500">{listing.type}</td>
                <td className="py-3 px-4 font-medium">₹{listing.price.toLocaleString()}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      onClick={() => approveListing.mutate(listing.id)}
                      loading={approveListing.isPending}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setRejectModal({ id: listing.id, title: listing.title })}
                    >
                      Reject
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={!!rejectModal}
        onClose={() => setRejectModal(null)}
        title={`Reject: ${rejectModal?.title || 'Listing'}`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Provide a reason for rejection (optional):</p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Reason..."
          />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setRejectModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleReject} loading={rejectListing.isPending}>Reject</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
