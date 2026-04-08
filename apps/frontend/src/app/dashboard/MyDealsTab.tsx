'use client';

import { useMyOffers, useAcceptOffer, useRejectOffer } from '@/hooks/useOffers';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { OFFER_STATUS_LABELS } from '@/lib/types';
import type { Offer, OfferStatus } from '@/lib/types';
import Link from 'next/link';

const offerBadge: Record<OfferStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  PENDING: 'warning',
  ACCEPTED: 'success',
  REJECTED: 'danger',
  COUNTERED: 'info',
};

export default function MyDealsTab() {
  const user = useAuthStore((s) => s.user);
  const { data: offers, isLoading } = useMyOffers();
  const acceptOffer = useAcceptOffer();
  const rejectOffer = useRejectOffer();

  if (isLoading) {
    return <div className="text-gray-500">Loading your deals...</div>;
  }

  const sent = (offers || []).filter((o: Offer) => o.senderId === user?.id);
  const received = (offers || []).filter((o: Offer) => o.receiverId === user?.id);

  const renderOffer = (offer: Offer, type: 'sent' | 'received') => (
    <div key={offer.id} className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-900">
            {offer.listings.length} listing{offer.listings.length > 1 ? 's' : ''}
          </p>
          <p className="text-xs text-gray-500">
            {type === 'sent' ? `To: ${offer.receiver?.name || 'Owner'}` : `From: ${offer.sender?.name || 'Agency'}`}
          </p>
        </div>
        <Badge variant={offerBadge[offer.status]}>{OFFER_STATUS_LABELS[offer.status]}</Badge>
      </div>

      <div className="flex items-center gap-4 text-sm mb-3">
        <span className="text-gray-500">Total: <strong>₹{offer.totalPrice.toLocaleString()}</strong></span>
        {offer.negotiatedPrice && (
          <span className="text-blue-600">Offer: <strong>₹{offer.negotiatedPrice.toLocaleString()}</strong></span>
        )}
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {offer.listings.map((l) => (
          <Link key={l.id} href={`/listings/${l.id}`} className="text-xs text-blue-600 hover:underline px-2 py-1 bg-blue-50 rounded">
            {l.title}
          </Link>
        ))}
      </div>

      {type === 'received' && offer.status === 'PENDING' && (
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <Button size="sm" onClick={() => acceptOffer.mutate(offer.id)} loading={acceptOffer.isPending}>
            Accept
          </Button>
          <Button size="sm" variant="danger" onClick={() => rejectOffer.mutate(offer.id)} loading={rejectOffer.isPending}>
            Reject
          </Button>
          {offer.conversationId && (
            <Link href={`/chat?conversation=${offer.conversationId}`}>
              <Button size="sm" variant="ghost">Chat</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <section>
        <h3 className="font-semibold text-gray-900 mb-4">Offers Received ({received.length})</h3>
        {received.length === 0 ? (
          <p className="text-sm text-gray-500">No offers received yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {received.map((o: Offer) => renderOffer(o, 'received'))}
          </div>
        )}
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 mb-4">Offers Sent ({sent.length})</h3>
        {sent.length === 0 ? (
          <p className="text-sm text-gray-500">No offers sent yet. Browse the marketplace to build deals.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sent.map((o: Offer) => renderOffer(o, 'sent'))}
          </div>
        )}
      </section>
    </div>
  );
}
