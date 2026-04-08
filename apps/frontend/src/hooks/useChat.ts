import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Conversation, ChatMessage } from '@/lib/types';

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.get<Conversation[]>('/conversations'),
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: ['conversations', id],
    queryFn: () => api.get<Conversation>(`/conversations/${id}`),
    enabled: !!id,
    refetchInterval: 5000, // poll every 5s for new messages
  });
}

export function useSendMessage(conversationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      api.post<ChatMessage>(`/conversations/${conversationId}/messages`, { content }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conversations', conversationId] });
    },
  });
}

export function useStartListingConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (listingId: string) =>
      api.post<Conversation>(`/conversations/listing/${listingId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
