import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, Link, X, ImageIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function ImageUpload({ value, onChange, error }) {
  const [mode, setMode] = useState('upload'); // 'upload' | 'url'
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [preview, setPreview] = useState(value || '');
  const inputRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be under 5MB.');
      return;
    }

    setUploadError('');
    setUploading(true);

    try {
      const ext = file.name.split('.').pop();
      const path = `campaigns/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('campaign-images')
        .upload(path, file, { upsert: false, contentType: file.type });

      if (uploadErr) throw uploadErr;

      const { data } = supabase.storage.from('campaign-images').getPublicUrl(path);
      setPreview(data.publicUrl);
      onChange(data.publicUrl);
    } catch (err) {
      setUploadError('Upload failed — try pasting an image URL instead.');
      setMode('url');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlChange = (e) => {
    setPreview(e.target.value);
    onChange(e.target.value);
  };

  const clearImage = () => {
    setPreview('');
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        Cover Image <span className="text-slate-400 font-normal">(optional)</span>
      </label>

      {/* Mode toggle */}
      <div className="flex rounded-lg border border-slate-200 overflow-hidden w-fit">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors',
            mode === 'upload' ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
          )}
        >
          <Upload size={13} /> Upload
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors border-l border-slate-200',
            mode === 'url' ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
          )}
        >
          <Link size={13} /> URL
        </button>
      </div>

      {/* Upload mode */}
      {mode === 'upload' && !preview && (
        <div
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl p-8 cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-colors"
        >
          {uploading ? (
            <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <ImageIcon size={28} className="text-slate-300" />
              <p className="text-sm text-slate-500">Click to upload an image</p>
              <p className="text-xs text-slate-400">PNG, JPG, WebP — max 5MB</p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
        </div>
      )}

      {/* URL mode */}
      {mode === 'url' && !preview && (
        <input
          type="url"
          placeholder="https://example.com/image.jpg"
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          onChange={handleUrlChange}
        />
      )}

      {/* Preview */}
      {preview && (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 h-48">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {(uploadError || error) && (
        <p className="text-xs text-red-500">{uploadError || error}</p>
      )}
    </div>
  );
}
