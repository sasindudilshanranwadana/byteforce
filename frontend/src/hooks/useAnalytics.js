import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// SCRUM-25: Analytics queries — pull from the campaign_analytics view
// and the campaign_daily_totals RPC. RLS ensures a campaigner only sees
// their own campaigns.

export function useCampaignAnalytics(creatorId) {
  return useQuery({
    queryKey: ['analytics', 'campaigns', creatorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_analytics')
        .select('*')
        .eq('creator_id', creatorId)
        .order('raised_amount', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!creatorId,
    staleTime: 1000 * 60,
  });
}

export function useCampaignDailyTotals(campaignId, days = 30) {
  return useQuery({
    queryKey: ['analytics', 'daily', campaignId, days],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('campaign_daily_totals', {
        p_campaign_id: campaignId,
        p_days: days,
      });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!campaignId,
    staleTime: 1000 * 60,
  });
}

export function useCampaignerSummary(creatorId) {
  return useQuery({
    queryKey: ['analytics', 'summary', creatorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_analytics')
        .select('raised_amount, donation_count, unique_backer_count, status')
        .eq('creator_id', creatorId);
      if (error) throw error;

      const rows = data ?? [];
      return {
        total_raised: rows.reduce((s, r) => s + Number(r.raised_amount || 0), 0),
        total_campaigns: rows.length,
        active_campaigns: rows.filter((r) => r.status === 'active').length,
        total_donations: rows.reduce((s, r) => s + Number(r.donation_count || 0), 0),
        total_unique_backers: rows.reduce((s, r) => s + Number(r.unique_backer_count || 0), 0),
      };
    },
    enabled: !!creatorId,
    staleTime: 1000 * 60,
  });
}
