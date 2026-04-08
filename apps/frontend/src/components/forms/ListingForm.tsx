'use client';

import { useState, FormEvent } from 'react';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import TagsInput from '@/components/ui/TagsInput';
import MapPicker from '@/components/ui/MapPicker';
import ImageUploader from '@/components/ui/ImageUploader';
import Calendar from '@/components/ui/Calendar';
import { LISTING_TYPES } from '@/lib/types';
import type { Listing, ListingType, CreateListingRequest } from '@/lib/types';

interface ListingFormProps {
  initialData?: Listing;
  onSubmit: (data: CreateListingRequest, images: File[]) => void;
  loading?: boolean;
}

export default function ListingForm({ initialData, onSubmit, loading }: ListingFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [type, setType] = useState<ListingType>(initialData?.type || 'HOARDING');
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [landmarks, setLandmarks] = useState<string[]>(initialData?.landmarks || []);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    initialData ? { lat: initialData.latitude, lng: initialData.longitude } : null
  );
  const [images, setImages] = useState<{ id?: string; url: string; file?: File }[]>(
    initialData?.images?.map((img) => ({ id: img.id, url: img.url })) || []
  );
  const [availability, setAvailability] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newFiles = images.filter((i) => i.file).map((i) => i.file!);
    onSubmit(
      {
        title,
        description,
        type,
        price: parseFloat(price),
        landmarks,
        latitude: coords?.lat || 0,
        longitude: coords?.lng || 0,
        availableFrom: availability.start?.toISOString(),
        availableTo: availability.end?.toISOString(),
      },
      newFiles
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-4">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Premium Hoarding near Highway"
          />

          <TextArea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Describe the advertising space, visibility, traffic, etc."
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value as ListingType)}
              options={LISTING_TYPES}
            />
            <Input
              label="Price (₹/month)"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="0"
              placeholder="50000"
            />
          </div>

          <TagsInput
            label="Landmarks"
            value={landmarks}
            onChange={setLandmarks}
            placeholder="Add landmarks near this location"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
            <ImageUploader images={images} onChange={setImages} />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location (Google Maps)</label>
            <MapPicker value={coords} onChange={setCoords} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <Calendar value={availability} onChange={setAvailability} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Button type="submit" loading={loading}>
          {initialData ? 'Update Listing' : 'Create Listing'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => window.history.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
