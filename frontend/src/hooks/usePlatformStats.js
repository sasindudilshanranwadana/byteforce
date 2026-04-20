import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function usePlatformStats() {
  return useQuery({
    queryKey: ['platform_stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_stats')
        .select('campaigns_funded, backers_count, total_raised, active_campaigns, donations_count')
        .single();
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}
