'use client';

import { useState } from 'react';
import { useListings } from '@/hooks/useListings';
import { useDealStore } from '@/stores/dealStore';
import ListingCard from '@/components/ListingCard';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { LISTING_TYPES } from '@/lib/types';
import type { ListingType, ListingsFilter, Listing } from '@/lib/types';

export default function MarketplacePage() {
  const addItem = useDealStore((s) => s.addItem);
  const [filters, setFilters] = useState<ListingsFilter>({});
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [landmark, setLandmark] = useState('');

  const activeFilters: ListingsFilter = {
    ...filters,
    search: search || undefined,
    type: (type as ListingType) || undefined,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    landmarks: landmark ? [landmark] : undefined,
  };

  const { data, isLoading } = useListings(activeFilters);
  const listings = data?.data || [];

  const applyFilters = () => {
    setFilters({
      search: search || undefined,
      type: (type as ListingType) || undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      landmarks: landmark ? [landmark] : undefined,
    });
  };

  const clearFilters = () => {
    setSearch('');
    setType('');
    setMinPrice('');
    setMaxPrice('');
    setLandmark('');
    setFilters({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
          <p className="text-sm text-gray-500 mt-1">Browse live outdoor advertising inventory</p>
        </div>
        {data?.total !== undefined && (
          <span className="text-sm text-gray-400 font-medium">{data.total} listing{data.total !== 1 ? 's' : ''} found</span>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-8 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
          <div className="lg:col-span-2">
            <Input
              placeholder="Search listings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') applyFilters(); }}
            />
          </div>
          <Select
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={LISTING_TYPES}
            placeholder="All Types"
          />
          <Input
            type="number"
            placeholder="Min ₹"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max ₹"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
          <div className="flex gap-2">
            <Button onClick={applyFilters} className="flex-1">Search</Button>
            <Button variant="ghost" onClick={clearFilters}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </Button>
          </div>
        </div>

        <div className="mt-3">
          <Input
            placeholder="Filter by landmark (e.g. MG Road, Andheri)"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
          />
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="animate-pulse bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="aspect-[4/3] bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-5 bg-gray-200 rounded w-1/3 mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <p className="text-gray-500 font-medium">No listings match your criteria</p>
          <p className="text-gray-400 text-sm mt-1 mb-4">Try adjusting your filters</p>
          <Button variant="secondary" onClick={clearFilters}>
            Clear All Filters
          </Button>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{data?.total || listings.length} results</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing: Listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                showActions
                onAddToDeal={(l) => addItem(l)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
