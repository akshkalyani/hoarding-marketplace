import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { AuthResponse, LoginRequest, SignupRequest, User } from '@/lib/types';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: (data: LoginRequest) => api.post<AuthResponse>('/auth/login', data),
    onSuccess: (res) => setAuth(res.user, res.token),
  });
}

export function useSignup() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: (data: SignupRequest) => api.post<AuthResponse>('/auth/signup', data),
    onSuccess: (res) => setAuth(res.user, res.token),
  });
}

export function useCurrentUser() {
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const user = await api.get<User>('/auth/me');
      setAuth(user, token!);
      return user;
    },
    enabled: !!token,
    retry: false,
    meta: { onError: () => logout() },
  });
}
