-- Create public storage bucket for campaign cover images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'campaign-images',
  'campaign-images',
  true,
  5242880, -- 5MB
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do nothing;

-- Allow authenticated users to upload
create policy "Authenticated users can upload campaign images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'campaign-images');

-- Allow public read
create policy "Public can view campaign images"
on storage.objects for select
to public
using (bucket_id = 'campaign-images');

-- Allow owners to delete their uploads
create policy "Users can delete own campaign images"
on storage.objects for delete
to authenticated
using (bucket_id = 'campaign-images' and auth.uid() = owner);
