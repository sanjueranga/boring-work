"use client"

import useSWR from 'swr';

export interface Session {
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useSession() {
  const { data: session, error, isLoading } = useSWR<Session | null>('/api/session', fetcher);

  return { session, loading: isLoading, error };
}