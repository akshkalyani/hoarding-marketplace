'use client';

import { useState, useCallback, useRef } from 'react';

interface MapPickerProps {
  value: { lat: number; lng: number } | null;
  onChange: (coords: { lat: number; lng: number }) => void;
  readOnly?: boolean;
}

export default function MapPicker({ value, onChange, readOnly = false }: MapPickerProps) {
  const [search, setSearch] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const mapSrc = value
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${value.lat},${value.lng}&zoom=15`
    : `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=19.076,72.8777&zoom=11`;

  const handleSearch = useCallback(async () => {
    if (!search.trim()) return;
    // Use Geocoding API to get coordinates from address
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(search)}&key=${apiKey}`
      );
      const data = await res.json();
      if (data.results?.[0]?.geometry?.location) {
        const { lat, lng } = data.results[0].geometry.location;
        onChange({ lat, lng });
      }
    } catch {
      // Fallback: manual entry
    }
  }, [search, apiKey, onChange]);

  return (
    <div className="w-full space-y-2">
      {!readOnly && (
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
            placeholder="Search location..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Search
          </button>
        </div>
      )}

      <div className="rounded-lg overflow-hidden border border-gray-200 h-64">
        {apiKey ? (
          <iframe
            ref={iframeRef}
            src={mapSrc}
            className="w-full h-full"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-sm text-gray-500">
            <div className="text-center">
              <p>Google Maps API key not configured</p>
              {value && (
                <p className="mt-1 font-mono text-xs">
                  {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {!readOnly && (
        <div className="flex gap-2">
          <input
            type="number"
            step="any"
            placeholder="Latitude"
            value={value?.lat ?? ''}
            onChange={(e) => {
              const lat = parseFloat(e.target.value);
              if (!isNaN(lat)) onChange({ lat, lng: value?.lng ?? 0 });
            }}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="number"
            step="any"
            placeholder="Longitude"
            value={value?.lng ?? ''}
            onChange={(e) => {
              const lng = parseFloat(e.target.value);
              if (!isNaN(lng)) onChange({ lat: value?.lat ?? 0, lng });
            }}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      )}
    </div>
  );
}
