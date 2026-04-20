import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useMyNotifications(userId, { limit = 50 } = {}) {
  return useQuery({
    queryKey: ['notifications', 'mine', userId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id, type, subject, status, sent_at, read_at, created_at, campaign_id,
          campaigns ( id, title, image_url )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('mark_all_notifications_read');
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications', 'mine'] }),
  });
}
