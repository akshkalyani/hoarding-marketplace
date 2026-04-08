'use client';

import { useRouter, useParams } from 'next/navigation';
import { useListing, useUpdateListing } from '@/hooks/useListings';
import ListingForm from '@/components/forms/ListingForm';
import type { CreateListingRequest } from '@/lib/types';

export default function EditListingPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: listing, isLoading } = useListing(id);
  const updateListing = useUpdateListing(id);

  const handleSubmit = async (data: CreateListingRequest, images: File[]) => {
    await updateListing.mutateAsync(data);
    if (images.length > 0) {
      const formData = new FormData();
      images.forEach((f) => formData.append('images', f));
      const token = localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${id}/images`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
    }
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-gray-500">Loading listing...</p>
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Listing</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ListingForm initialData={listing} onSubmit={handleSubmit} loading={updateListing.isPending} />
      </div>
    </div>
  );
}
