import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// SCRUM-23: Campaign Updates — read/write hooks
// Posting an update also triggers the email notification flow (SCRUM-24) via DB trigger.

const updateKeys = {
  all: ['campaign_updates'],
  byCampaign: (id) => [...updateKeys.all, 'campaign', id],
};

export function useCampaignUpdates(campaignId) {
  return useQuery({
    queryKey: updateKeys.byCampaign(campaignId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_updates')
        .select(`
          *,
          profiles:author_id ( id, name, avatar_url )
        `)
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!campaignId,
    staleTime: 1000 * 30,
  });
}

export function useCreateCampaignUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ campaign_id, author_id, title, body }) => {
      if (!title?.trim()) throw new Error('Title is required');
      if (!body?.trim()) throw new Error('Body is required');
      if (title.length > 140) throw new Error('Title must be 140 characters or fewer');
      if (body.length > 5000) throw new Error('Body must be 5000 characters or fewer');

      const { data, error } = await supabase
        .from('campaign_updates')
        .insert({
          campaign_id,
          author_id,
          title: title.trim(),
          body: body.trim(),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: updateKeys.byCampaign(vars.campaign_id) });
    },
  });
}

export function useDeleteCampaignUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, campaign_id }) => {
      const { error } = await supabase
        .from('campaign_updates')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { id, campaign_id };
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: updateKeys.byCampaign(vars.campaign_id) });
    },
  });
}
