import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  Listing,
  CreateListingRequest,
  ListingsFilter,
  PaginatedResponse,
  ListingImage,
} from '@/lib/types';

export function useListings(filters?: ListingsFilter) {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params.set(key, Array.isArray(val) ? val.join(',') : String(val));
      }
    });
  }
  const qs = params.toString();

  return useQuery({
    queryKey: ['listings', filters],
    queryFn: () => api.get<PaginatedResponse<Listing>>(`/listings${qs ? `?${qs}` : ''}`),
  });
}

export function useMyListings() {
  return useQuery({
    queryKey: ['listings', 'mine'],
    queryFn: () => api.get<Listing[]>('/listings/mine'),
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: ['listings', id],
    queryFn: () => api.get<Listing>(`/listings/${id}`),
    enabled: !!id,
  });
}

export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateListingRequest) => api.post<Listing>('/listings', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

export function useUpdateListing(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateListingRequest>) =>
      api.put<Listing>(`/listings/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

export function useDeleteListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/listings/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

export function useUploadListingImages(listingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (files: File[]) => {
      const formData = new FormData();
      files.forEach((f) => formData.append('images', f));
      return api.upload<ListingImage[]>(`/listings/${listingId}/images`, formData);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['listings', listingId] });
    },
  });
}

export function useSubmitListing(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/listings/${id}/submit`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}
