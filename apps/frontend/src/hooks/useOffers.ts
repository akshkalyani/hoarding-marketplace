import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Offer, CreateOfferRequest } from '@/lib/types';

export function useMyOffers() {
  return useQuery({
    queryKey: ['offers', 'mine'],
    queryFn: () => api.get<Offer[]>('/offers'),
  });
}

export function useOffer(id: string) {
  return useQuery({
    queryKey: ['offers', id],
    queryFn: () => api.get<Offer>(`/offers/${id}`),
    enabled: !!id,
  });
}

export function useCreateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOfferRequest) => api.post<Offer>('/offers', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['offers'] });
    },
  });
}

export function useAcceptOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/offers/${id}/accept`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['offers'] });
    },
  });
}

export function useRejectOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/offers/${id}/reject`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['offers'] });
    },
  });
}

export function useCounterOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, negotiatedPrice }: { id: string; negotiatedPrice: number }) =>
      api.post(`/offers/${id}/counter`, { negotiatedPrice }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['offers'] });
    },
  });
}
