'use client';

import { useRouter } from 'next/navigation';
import { useCreateListing } from '@/hooks/useListings';
import { api } from '@/lib/api';
import ListingForm from '@/components/forms/ListingForm';
import type { CreateListingRequest } from '@/lib/types';

export default function NewListingPage() {
  const router = useRouter();
  const createListing = useCreateListing();

  const handleSubmit = async (data: CreateListingRequest, images: File[]) => {
    // 1. Create listing (status: DRAFT)
    const listing = await createListing.mutateAsync(data);

    // 2. Upload images if any
    if (images.length > 0) {
      const formData = new FormData();
      images.forEach((f) => formData.append('images', f));
      await api.upload(`/listings/${listing.id}/images`, formData);
    }

    // 3. Auto-submit for admin approval (DRAFT → PENDING)
    await api.post(`/listings/${listing.id}/submit`);

    router.push('/dashboard');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Listing</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ListingForm onSubmit={handleSubmit} loading={createListing.isPending} />
      </div>
    </div>
  );
}
