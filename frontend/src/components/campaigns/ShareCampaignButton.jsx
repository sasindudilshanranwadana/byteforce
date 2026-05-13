import { useState } from 'react';
import { Share2, Twitter, Facebook, Linkedin, Link2, Mail, Check } from 'lucide-react';
import { toast } from 'sonner';

// SCRUM-28: Social-media sharing for campaigns
// Supports: Twitter/X, Facebook, LinkedIn, Email, Copy Link, and the
// Web Share API where available (mobile browsers).
// No tracking — uses standard public share URLs with the campaign link
// + a short pre-filled message.

export default function ShareCampaignButton({ campaign }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/campaigns/${campaign.id}`
    : `/campaigns/${campaign.id}`;
  const text = `Support "${campaign.title}" on Byteforce`;

  const links = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    email: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`,
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return false;
    try {
      await navigator.share({ title: campaign.title, text, url });
      return true;
    } catch (err) {
      // user cancelled or unsupported — fall through to popover
      return false;
    }
  };

  const handleClick = async () => {
    const usedNative = await handleNativeShare();
    if (!usedNative) setOpen((v) => !v);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Share2 size={16} />
        Share
      </button>

      {open && (
        <>
          {/* click-away overlay */}
          <button
            aria-label="Close share menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
            tabIndex={-1}
          />
          <div
            role="menu"
            className="absolute right-0 mt-2 z-50 w-56 rounded-2xl border border-slate-200 bg-white shadow-xl p-2"
          >
            <ShareItem href={links.twitter} icon={<Twitter size={16} className="text-sky-500" />} label="Twitter / X" />
            <ShareItem href={links.facebook} icon={<Facebook size={16} className="text-blue-600" />} label="Facebook" />
            <ShareItem href={links.linkedin} icon={<Linkedin size={16} className="text-blue-700" />} label="LinkedIn" />
            <ShareItem href={links.email} icon={<Mail size={16} className="text-slate-500" />} label="Email" />
            <div className="my-1 h-px bg-slate-100" />
            <button
              type="button"
              onClick={handleCopy}
              role="menuitem"
              className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              {copied ? <Check size={16} className="text-emerald-500" /> : <Link2 size={16} className="text-slate-500" />}
              {copied ? 'Link copied!' : 'Copy link'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ShareItem({ href, icon, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      role="menuitem"
      className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
    >
      {icon}
      {label}
    </a>
  );
}
