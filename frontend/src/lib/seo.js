// SCRUM-28 helper: set Open Graph + Twitter Card meta tags so shared
// campaign links render rich previews on social networks.
// Called from CampaignDetailPage on mount.

const TAG_IDS = {
  'og:title': 'og-title',
  'og:description': 'og-description',
  'og:image': 'og-image',
  'og:url': 'og-url',
  'og:type': 'og-type',
  'twitter:card': 'twitter-card',
  'twitter:title': 'twitter-title',
  'twitter:description': 'twitter-description',
  'twitter:image': 'twitter-image',
};

function upsertMeta(property, content) {
  const id = TAG_IDS[property] || `meta-${property}`;
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('meta');
    el.id = id;
    if (property.startsWith('og:')) {
      el.setAttribute('property', property);
    } else {
      el.setAttribute('name', property);
    }
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function setCampaignMeta(campaign) {
  if (!campaign) return;
  const url = `${window.location.origin}/campaigns/${campaign.id}`;
  const desc = (campaign.description || '').slice(0, 200);
  const image = campaign.image_url || `${window.location.origin}/og-default.png`;

  upsertMeta('og:title', campaign.title);
  upsertMeta('og:description', desc);
  upsertMeta('og:image', image);
  upsertMeta('og:url', url);
  upsertMeta('og:type', 'website');
  upsertMeta('twitter:card', 'summary_large_image');
  upsertMeta('twitter:title', campaign.title);
  upsertMeta('twitter:description', desc);
  upsertMeta('twitter:image', image);

  document.title = `${campaign.title} · Byteforce`;
}
