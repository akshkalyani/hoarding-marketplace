'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDealStore } from '@/stores/dealStore';
import { useCreateOffer } from '@/hooks/useOffers';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Link from 'next/link';

export default function DealsPage() {
  const router = useRouter();
  const { items, removeItem, clearItems, totalPrice } = useDealStore();
  const createOffer = useCreateOffer();
  const [negotiatedPrice, setNegotiatedPrice] = useState('');
  const [receiverId, setReceiverId] = useState('');

  const handleSendOffer = async () => {
    if (items.length === 0) return;

    // Determine receiver: use the owner of the first listing if not specified
    const targetReceiverId = receiverId || items[0]?.listing.ownerId || '';
    if (!targetReceiverId) return;

    await createOffer.mutateAsync({
      listingIds: items.map((i) => i.listing.id),
      totalPrice: totalPrice(),
      negotiatedPrice: negotiatedPrice ? parseFloat(negotiatedPrice) : undefined,
      receiverId: targetReceiverId,
    });

    clearItems();
    setNegotiatedPrice('');
    router.push('/dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Deal Builder</h1>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 mb-4">Your deal cart is empty.</p>
          <Link href="/marketplace">
            <Button>Browse Marketplace</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Listing items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div
                key={item.listing.id}
                className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4"
              >
                <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {item.listing.images?.[0] ? (
                    <img src={item.listing.images[0].url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No img
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <Link href={`/listings/${item.listing.id}`} className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1">
                    {item.listing.title}
                  </Link>
                  <p className="text-sm text-gray-500">{item.listing.type} • {item.listing.landmarks?.slice(0, 2).join(', ')}</p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gray-900">₹{item.listing.price.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">/month</p>
                </div>

                <button
                  onClick={() => removeItem(item.listing.id)}
                  className="text-gray-400 hover:text-red-600 ml-2"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Deal Summary</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Listings</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Total Price</span>
                  <span className="font-bold text-lg">₹{totalPrice().toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <Input
                  label="Your Offer Price (₹)"
                  type="number"
                  value={negotiatedPrice}
                  onChange={(e) => setNegotiatedPrice(e.target.value)}
                  placeholder="Enter negotiated price"
                />

                <Input
                  label="Send to (Owner ID)"
                  value={receiverId}
                  onChange={(e) => setReceiverId(e.target.value)}
                  placeholder="Auto-detect from listings"
                />
              </div>

              {negotiatedPrice && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm">
                  <p className="text-blue-800">
                    Discount: <strong>{Math.round((1 - parseFloat(negotiatedPrice) / totalPrice()) * 100)}%</strong> off list price
                  </p>
                </div>
              )}

              <div className="mt-4 space-y-2">
                <Button
                  className="w-full"
                  onClick={handleSendOffer}
                  loading={createOffer.isPending}
                  disabled={items.length === 0}
                >
                  Send Offer
                </Button>
                <Button variant="ghost" className="w-full" onClick={clearItems}>
                  Clear All
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
