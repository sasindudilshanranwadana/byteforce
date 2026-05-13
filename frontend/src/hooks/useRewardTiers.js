import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { campaignKeys } from './useCampaigns';

// SCRUM-22: Reward Tiers — full CRUD via Supabase

const rewardKeys = {
  all: ['reward_tiers'],
  byCampaign: (campaignId) => [...rewardKeys.all, 'campaign', campaignId],
};

export function useRewardTiers(campaignId) {
  return useQuery({
    queryKey: rewardKeys.byCampaign(campaignId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reward_tiers')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('minimum_amount', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!campaignId,
  });
}

export function useCreateRewardTier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ campaign_id, title, description, minimum_amount }) => {
      if (!title?.trim()) throw new Error('Title is required');
      if (!minimum_amount || minimum_amount < 1) throw new Error('Minimum amount must be at least $1');

      const { data, error } = await supabase
        .from('reward_tiers')
        .insert({
          campaign_id,
          title: title.trim(),
          description: description?.trim() || '',
          minimum_amount: Number(minimum_amount),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: rewardKeys.byCampaign(vars.campaign_id) });
      qc.invalidateQueries({ queryKey: campaignKeys.detail(vars.campaign_id) });
    },
  });
}

export function useUpdateRewardTier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, campaign_id, ...updates }) => {
      const { data, error } = await supabase
        .from('reward_tiers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: rewardKeys.byCampaign(vars.campaign_id) });
      qc.invalidateQueries({ queryKey: campaignKeys.detail(vars.campaign_id) });
    },
  });
}

export function useDeleteRewardTier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, campaign_id }) => {
      const { error } = await supabase
        .from('reward_tiers')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { id, campaign_id };
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: rewardKeys.byCampaign(vars.campaign_id) });
      qc.invalidateQueries({ queryKey: campaignKeys.detail(vars.campaign_id) });
    },
  });
}
