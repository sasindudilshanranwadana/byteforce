-- ============================================================
-- Byteforce — Seed Data for Testing
-- ============================================================
-- Run this in Supabase SQL Editor AFTER creating all 6 auth users:
--   admin@byteforce.test        / Byteforce123!
--   campaigner1@byteforce.test  / Byteforce123!
--   campaigner2@byteforce.test  / Byteforce123!
--   backer1@byteforce.test      / Byteforce123!
--   backer2@byteforce.test      / Byteforce123!
--   backer3@byteforce.test      / Byteforce123!
--
-- This script looks up the real UUIDs from auth.users by email,
-- so it works regardless of what Supabase assigned.
-- ============================================================

do $$
declare
  admin_id       uuid;
  campaigner1_id uuid;
  campaigner2_id uuid;
  backer1_id     uuid;
  backer2_id     uuid;
  backer3_id     uuid;

  camp1_id uuid := uuid_generate_v4();
  camp2_id uuid := uuid_generate_v4();
  camp3_id uuid := uuid_generate_v4();
  camp4_id uuid := uuid_generate_v4();
  camp5_id uuid := uuid_generate_v4();

  tier1a_id uuid := uuid_generate_v4();
  tier1b_id uuid := uuid_generate_v4();
  tier1c_id uuid := uuid_generate_v4();
  tier2a_id uuid := uuid_generate_v4();
  tier2b_id uuid := uuid_generate_v4();
  tier3a_id uuid := uuid_generate_v4();
  tier4a_id uuid := uuid_generate_v4();
  tier4b_id uuid := uuid_generate_v4();

begin

-- ─── Look up real UUIDs from auth.users ──────────────────────────────────────
select id into admin_id       from auth.users where email = 'admin@byteforce.test'        limit 1;
select id into campaigner1_id from auth.users where email = 'campaigner1@byteforce.test'  limit 1;
select id into campaigner2_id from auth.users where email = 'campaigner2@byteforce.test'  limit 1;
select id into backer1_id     from auth.users where email = 'backer1@byteforce.test'      limit 1;
select id into backer2_id     from auth.users where email = 'backer2@byteforce.test'      limit 1;
select id into backer3_id     from auth.users where email = 'backer3@byteforce.test'      limit 1;

-- Abort with a clear message if any user is missing
if admin_id is null then
  raise exception 'User admin@byteforce.test not found in auth.users — create it in Supabase Auth first';
end if;
if campaigner1_id is null then
  raise exception 'User campaigner1@byteforce.test not found in auth.users — create it in Supabase Auth first';
end if;
if campaigner2_id is null then
  raise exception 'User campaigner2@byteforce.test not found in auth.users — create it in Supabase Auth first';
end if;
if backer1_id is null then
  raise exception 'User backer1@byteforce.test not found in auth.users — create it in Supabase Auth first';
end if;
if backer2_id is null then
  raise exception 'User backer2@byteforce.test not found in auth.users — create it in Supabase Auth first';
end if;
if backer3_id is null then
  raise exception 'User backer3@byteforce.test not found in auth.users — create it in Supabase Auth first';
end if;

-- ─── Upsert profiles ─────────────────────────────────────────────────────────
insert into public.profiles (id, name, role, avatar_url) values
  (admin_id,       'Alex Admin',     'admin',      'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexAdmin'),
  (campaigner1_id, 'Priya Sharma',   'campaigner', 'https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaSharma'),
  (campaigner2_id, 'Jordan Lee',     'campaigner', 'https://api.dicebear.com/7.x/avataaars/svg?seed=JordanLee'),
  (backer1_id,     'Marcus Johnson', 'backer',     'https://api.dicebear.com/7.x/avataaars/svg?seed=MarcusJohnson'),
  (backer2_id,     'Sofia Nguyen',   'backer',     'https://api.dicebear.com/7.x/avataaars/svg?seed=SofiaNguyen'),
  (backer3_id,     'Liam Chen',      'backer',     'https://api.dicebear.com/7.x/avataaars/svg?seed=LiamChen')
on conflict (id) do update set
  name       = excluded.name,
  role       = excluded.role,
  avatar_url = excluded.avatar_url;

-- ─── Campaigns ───────────────────────────────────────────────────────────────

insert into public.campaigns
  (id, creator_id, title, description, category, goal_amount, raised_amount, image_url, deadline, status)
values (
  camp1_id, campaigner1_id,
  'EcoTrack — Sustainable Living App',
  'EcoTrack is a mobile-first app that helps households track their carbon footprint in real time. By connecting to your smart home devices, energy bills, and transport habits, EcoTrack gives you a personalised daily score and actionable tips to reduce emissions. We are a team of four CDU students passionate about climate action and software engineering. Funds will cover cloud hosting, API integrations, and a 6-month beta launch. Join us in making sustainable living measurable and fun!',
  'technology', 5000.00, 3400.00,
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  now() + interval '18 days', 'active'
);

insert into public.campaigns
  (id, creator_id, title, description, category, goal_amount, raised_amount, image_url, deadline, status)
values (
  camp2_id, campaigner1_id,
  'Open Music Lab — Free Instruments for Kids',
  'Open Music Lab gives underprivileged children access to real instruments and professional music tuition. For every $150 raised, one child receives a semester of free lessons and instrument hire. Our first cohort of 20 students is ready — we just need the funding to start. 100% of donations go directly to instrument purchase and teacher fees. We are partnering with Darwin Community Arts to deliver the programme starting Term 3 2026.',
  'music', 3000.00, 3250.00,
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80',
  now() + interval '5 days', 'closed'
);

insert into public.campaigns
  (id, creator_id, title, description, category, goal_amount, raised_amount, image_url, deadline, status)
values (
  camp3_id, campaigner2_id,
  'CodeStart NT — Free Coding Bootcamp for Regional Youth',
  'CodeStart NT delivers a 10-week beginner coding bootcamp to young people aged 15–25 in regional Northern Territory. With zero prior experience required, participants learn Python, web basics, and problem-solving skills. We have already run a successful pilot with 12 students in Katherine. This campaign funds the next cohort of 30 students including laptops, internet data vouchers, and facilitator travel. Help us bridge the digital divide in the NT!',
  'education', 8000.00, 1760.00,
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80',
  now() + interval '30 days', 'active'
);

insert into public.campaigns
  (id, creator_id, title, description, category, goal_amount, raised_amount, image_url, deadline, status)
values (
  camp4_id, campaigner2_id,
  'MindBridge — Mental Health Chat App for Uni Students',
  'MindBridge is an anonymous peer-support chat platform designed specifically for university students. Studies show 1 in 3 students experience significant mental health challenges, yet less than 40% seek professional help. MindBridge lowers the barrier by connecting students with trained peer supporters 24/7. All supporters are vetted volunteers trained in Mental Health First Aid. Funds cover app development, moderation tools, and a 12-month pilot across three universities.',
  'health', 6500.00, 5785.00,
  'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&q=80',
  now() + interval '8 days', 'active'
);

insert into public.campaigns
  (id, creator_id, title, description, category, goal_amount, raised_amount, image_url, deadline, status)
values (
  camp5_id, campaigner1_id,
  'Darwin Reef Watch — Citizen Science Coral Monitoring',
  'Darwin Reef Watch trains local volunteers to monitor coral health at six reef sites around Darwin Harbour using underwater photography and AI-assisted species identification. Data collected feeds directly into the NT Government marine conservation database. With climate change accelerating coral bleaching events, early detection is critical. Funds purchase dive equipment, waterproof cameras, and training materials for 40 volunteer divers over two years.',
  'environment', 4200.00, 0.00,
  'https://images.unsplash.com/photo-1504578085108-8e44cf5fc4a5?w=800&q=80',
  now() + interval '45 days', 'pending'
);

-- ─── Reward Tiers ─────────────────────────────────────────────────────────────

insert into public.reward_tiers (id, campaign_id, title, minimum_amount, description) values
  (tier1a_id, camp1_id, 'Supporter',    25.00,  'Your name listed in the app credits + early access to the beta.'),
  (tier1b_id, camp1_id, 'Green Pioneer',75.00,  'Everything in Supporter + exclusive EcoTrack tote bag + 1-year premium subscription.'),
  (tier1c_id, camp1_id, 'Climate Hero', 200.00, 'Everything in Green Pioneer + 1:1 onboarding call with the founders + your logo on the splash screen.');

insert into public.reward_tiers (id, campaign_id, title, minimum_amount, description) values
  (tier2a_id, camp2_id, 'Music Friend',   50.00, 'Sponsor one month of lessons for a student. Receive a thank-you card drawn by the student.'),
  (tier2b_id, camp2_id, 'Instrument Hero',150.00,'Sponsor a full semester including instrument hire. Named plaque on the instrument + concert invitation.');

insert into public.reward_tiers (id, campaign_id, title, minimum_amount, description) values
  (tier3a_id, camp3_id, 'Digital Ally', 50.00, 'Sponsor a student data voucher for 10 weeks + shout-out in our graduation ceremony program.');

insert into public.reward_tiers (id, campaign_id, title, minimum_amount, description) values
  (tier4a_id, camp4_id, 'Wellbeing Supporter',    30.00,  'Your name in the app thank-you page + early access to MindBridge when it launches.'),
  (tier4b_id, camp4_id, 'Mental Health Champion', 100.00, 'Everything in Wellbeing Supporter + certificate of appreciation + invitation to our pilot launch event.');

-- ─── Donations ───────────────────────────────────────────────────────────────

insert into public.donations
  (backer_id, campaign_id, reward_tier_id, amount, status, stripe_payment_intent_id, created_at)
values
  -- Campaign 1 (raised: 3400)
  (backer1_id, camp1_id, tier1b_id, 75.00,  'completed', 'pi_test_001', now() - interval '14 days'),
  (backer2_id, camp1_id, tier1a_id, 25.00,  'completed', 'pi_test_002', now() - interval '12 days'),
  (backer3_id, camp1_id, tier1c_id, 200.00, 'completed', 'pi_test_003', now() - interval '10 days'),
  (backer1_id, camp1_id, tier1b_id, 75.00,  'completed', 'pi_test_004', now() - interval '8 days'),
  (backer2_id, camp1_id, tier1c_id, 200.00, 'completed', 'pi_test_005', now() - interval '6 days'),
  (backer3_id, camp1_id, tier1a_id, 25.00,  'completed', 'pi_test_006', now() - interval '5 days'),
  (backer1_id, camp1_id, tier1b_id, 75.00,  'completed', 'pi_test_007', now() - interval '4 days'),
  (backer2_id, camp1_id, tier1b_id, 75.00,  'completed', 'pi_test_008', now() - interval '3 days'),
  (backer3_id, camp1_id, tier1b_id, 75.00,  'completed', 'pi_test_009', now() - interval '2 days'),
  (backer1_id, camp1_id, tier1c_id, 200.00, 'completed', 'pi_test_010', now() - interval '1 day'),
  (backer2_id, camp1_id, null,       50.00, 'completed', 'pi_test_011', now() - interval '12 hours'),
  (backer3_id, camp1_id, tier1b_id, 75.00,  'pending',   'pi_test_012', now() - interval '1 hour'),

  -- Campaign 2 (raised: 3250, closed)
  (backer1_id, camp2_id, tier2b_id, 150.00, 'completed', 'pi_test_013', now() - interval '20 days'),
  (backer2_id, camp2_id, tier2a_id,  50.00, 'completed', 'pi_test_014', now() - interval '18 days'),
  (backer3_id, camp2_id, tier2b_id, 150.00, 'completed', 'pi_test_015', now() - interval '16 days'),
  (backer1_id, camp2_id, tier2a_id,  50.00, 'completed', 'pi_test_016', now() - interval '14 days'),
  (backer2_id, camp2_id, tier2b_id, 150.00, 'completed', 'pi_test_017', now() - interval '12 days'),
  (backer3_id, camp2_id, tier2b_id, 150.00, 'completed', 'pi_test_018', now() - interval '10 days'),
  (backer1_id, camp2_id, null,      100.00, 'completed', 'pi_test_019', now() - interval '8 days'),
  (backer2_id, camp2_id, tier2b_id, 150.00, 'completed', 'pi_test_020', now() - interval '6 days'),
  (backer3_id, camp2_id, null,      250.00, 'completed', 'pi_test_021', now() - interval '4 days'),
  (backer1_id, camp2_id, tier2b_id, 150.00, 'completed', 'pi_test_022', now() - interval '2 days'),
  (backer2_id, camp2_id, tier2b_id, 150.00, 'completed', 'pi_test_023', now() - interval '1 day'),
  (backer3_id, camp2_id, null,       50.00, 'completed', 'pi_test_024', now() - interval '6 hours'),
  (backer1_id, camp2_id, tier2a_id,  50.00, 'completed', 'pi_test_025', now() - interval '2 hours'),
  (backer2_id, camp2_id, null,      100.00, 'completed', 'pi_test_026', now() - interval '30 minutes'),
  (backer3_id, camp2_id, tier2b_id, 150.00, 'completed', 'pi_test_027', now() - interval '10 minutes'),
  (backer1_id, camp2_id, null,      600.00, 'completed', 'pi_test_028', now() - interval '5 minutes'),

  -- Campaign 3 (raised: 1760)
  (backer1_id, camp3_id, tier3a_id, 50.00,  'completed', 'pi_test_029', now() - interval '9 days'),
  (backer3_id, camp3_id, tier3a_id, 50.00,  'completed', 'pi_test_030', now() - interval '7 days'),
  (backer2_id, camp3_id, null,      100.00, 'completed', 'pi_test_031', now() - interval '5 days'),
  (backer1_id, camp3_id, tier3a_id, 50.00,  'completed', 'pi_test_032', now() - interval '3 days'),

  -- Campaign 4 (raised: 5785)
  (backer2_id, camp4_id, tier4b_id, 100.00, 'completed', 'pi_test_033', now() - interval '22 days'),
  (backer1_id, camp4_id, tier4a_id,  30.00, 'completed', 'pi_test_034', now() - interval '20 days'),
  (backer3_id, camp4_id, tier4b_id, 100.00, 'completed', 'pi_test_035', now() - interval '18 days'),
  (backer2_id, camp4_id, tier4b_id, 100.00, 'completed', 'pi_test_036', now() - interval '15 days'),
  (backer1_id, camp4_id, tier4a_id,  30.00, 'completed', 'pi_test_037', now() - interval '12 days'),
  (backer3_id, camp4_id, null,      200.00, 'completed', 'pi_test_038', now() - interval '9 days'),
  (backer2_id, camp4_id, tier4b_id, 100.00, 'completed', 'pi_test_039', now() - interval '6 days'),
  (backer1_id, camp4_id, null,       50.00, 'completed', 'pi_test_040', now() - interval '3 days');

end $$;

-- ─── Verify ───────────────────────────────────────────────────────────────────
select
  c.title,
  c.status,
  c.goal_amount,
  c.raised_amount,
  round(c.raised_amount / c.goal_amount * 100) || '%' as funded_pct,
  count(d.id) filter (where d.status = 'completed') as completed_donations,
  p.name as creator
from public.campaigns c
join public.profiles p on p.id = c.creator_id
left join public.donations d on d.campaign_id = c.id
group by c.id, p.name
order by c.created_at;
-- seed: updated to use real auth.users UUIDs
