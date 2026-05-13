import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// SCRUM-24: Read the current user's email notification log
// (sent + pending + failed). Used on the user dashboard so backers can
// see what they've been emailed about.

export function useMyNotifications(userId, { limit = 50 } = {}) {
  return useQuery({
    queryKey: ['notifications', 'mine', userId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id, type, subject, status, sent_at, created_at, campaign_id,
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
