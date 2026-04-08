'use client';

import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import type { Listing } from '@/lib/types';
import { LISTING_TYPES } from '@/lib/types';

interface ListingCardProps {
  listing: Listing;
  showActions?: boolean;
  onAddToDeal?: (listing: Listing) => void;
}

const statusBadge: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  DRAFT: 'default',
  PENDING: 'warning',
  APPROVED: 'info',
  LIVE: 'success',
  REJECTED: 'danger',
};

const API_HOST = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace('/api', '');

function getImageUrl(url?: string) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_HOST}${url}`;
}

export default function ListingCard({ listing, showActions, onAddToDeal }: ListingCardProps) {
  const typeLabel = LISTING_TYPES.find((t) => t.value === listing.type)?.label || listing.type;
  const imgSrc = getImageUrl(listing.images?.[0]?.url);

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:shadow-gray-200/50 hover:border-gray-300 transition-all duration-200">
      <Link href={`/listings/${listing.id}`}>
        <div className="aspect-[4/3] relative bg-gray-100 overflow-hidden">
          {imgSrc ? (
            <img src={imgSrc} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
              <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" /></svg>
              <span className="text-xs">No image</span>
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {listing.isFeatured && (
              <span className="px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-lg shadow-sm">
                ⭐ Featured
              </span>
            )}
            <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-lg shadow-sm">
              {typeLabel}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link href={`/listings/${listing.id}`}>
            <h3 className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-1 transition-colors">
              {listing.title}
            </h3>
          </Link>
          <Badge variant={statusBadge[listing.status]}>{listing.status}</Badge>
        </div>

        <p className="text-sm text-gray-500 mb-3 line-clamp-2 leading-relaxed">{listing.description}</p>

        {listing.landmarks?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {listing.landmarks.slice(0, 3).map((l, i) => (
              <span key={i} className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded-md text-xs text-gray-500">
                {l}
              </span>
            ))}
            {listing.landmarks.length > 3 && (
              <span className="px-2 py-0.5 text-xs text-gray-400">+{listing.landmarks.length - 3}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-lg font-bold text-gray-900">
            ₹{listing.price.toLocaleString()}<span className="text-xs font-normal text-gray-400 ml-0.5">/mo</span>
          </span>
          {showActions && onAddToDeal && (
            <button
              onClick={() => onAddToDeal(listing)}
              className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              + Add to Deal
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
