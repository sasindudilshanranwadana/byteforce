import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// ─── Query keys ──────────────────────────────────────────────────────────────
export const campaignKeys = {
  all: ['campaigns'],
  lists: () => [...campaignKeys.all, 'list'],
  list: (filters) => [...campaignKeys.lists(), filters],
  detail: (id) => [...campaignKeys.all, 'detail', id],
  myList: (userId) => [...campaignKeys.all, 'my', userId],
};

// ─── Fetch campaigns with filters ────────────────────────────────────────────
export function useCampaigns({ category, search, status = 'active', limit = 20, offset = 0 } = {}) {
  return useQuery({
    queryKey: campaignKeys.list({ category, search, status, limit, offset }),
    queryFn: async () => {
      let query = supabase
        .from('campaigns')
        .select(`
          *,
          profiles:creator_id ( id, name, avatar_url )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) query = query.eq('status', status);
      if (category) query = query.eq('category', category);
      if (search) query = query.ilike('title', `%${search}%`);

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// ─── Fetch single campaign by ID ──────────────────────────────────────────────
export function useCampaign(id) {
  return useQuery({
    queryKey: campaignKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          profiles:creator_id ( id, name, avatar_url ),
          reward_tiers ( * )
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 1,
  });
}

// ─── Fetch campaigns by creator ───────────────────────────────────────────────
export function useMyCampaigns(userId) {
  return useQuery({
    queryKey: campaignKeys.myList(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*, reward_tiers(*)')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 1,
  });
}

// ─── All campaigns (admin) ────────────────────────────────────────────────────
export function useAllCampaigns() {
  return useQuery({
    queryKey: campaignKeys.list({ status: 'all' }),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`*, profiles:creator_id ( id, name, avatar_url )`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 30,
  });
}

// ─── Create campaign ──────────────────────────────────────────────────────────
export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ campaign, rewardTiers }) => {
      const { data, error } = await supabase
        .from('campaigns')
        .insert(campaign)
        .select()
        .single();
      if (error) throw error;

      if (rewardTiers?.length > 0) {
        const tiers = rewardTiers.map((t) => ({ ...t, campaign_id: data.id }));
        const { error: tierError } = await supabase.from('reward_tiers').insert(tiers);
        if (tierError) throw tierError;
      }
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: campaignKeys.all });
    },
  });
}

// ─── Update campaign status (admin) ──────────────────────────────────────────
export function useUpdateCampaignStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const { data, error } = await supabase
        .from('campaigns')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: campaignKeys.all });
    },
  });
}

// ─── Fetch donations for a backer ─────────────────────────────────────────────
export function useMyDonations(backerId) {
  return useQuery({
    queryKey: ['donations', 'backer', backerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('donations')
        .select(`
          *,
          campaigns ( id, title, image_url, status ),
          reward_tiers ( id, title )
        `)
        .eq('backer_id', backerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!backerId,
    staleTime: 1000 * 60,
  });
}

// ─── Fetch donations for a campaign (creator view) ───────────────────────────
export function useCampaignDonations(campaignId) {
  return useQuery({
    queryKey: ['donations', 'campaign', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('donations')
        .select(`
          *,
          profiles:backer_id ( id, name, avatar_url )
        `)
        .eq('campaign_id', campaignId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!campaignId,
    staleTime: 1000 * 60,
  });
}
