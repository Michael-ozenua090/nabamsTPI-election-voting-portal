'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, CreditCard, CheckCircle, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { uploadVoterDocuments } from '@/app/actions/auth';

// Client-side canvas compression — max 800px, target < 500KB
async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const MAX = 800;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) {
            height = Math.round((height * MAX) / width);
            width = MAX;
          } else {
            width = Math.round((width * MAX) / height);
            height = MAX;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(file); return; }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) { resolve(file); return; }
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          },
          'image/jpeg',
          0.82
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

interface FileUploadZoneProps {
  label: string;
  icon: React.ReactNode;
  id: string;
  file: File | null;
  onChange: (file: File) => void;
}

function FileUploadZone({ label, icon, id, file, onChange }: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      try {
        const compressed = await compressImage(f);
        onChange(compressed);
      } catch {
        onChange(f);
      }
    },
    [onChange]
  );

  return (
    <div
      className={[
        'relative rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200',
        file
          ? 'border-nabams-gold/60 bg-yellow-900/10'
          : 'border-white/20 hover:border-white/40 hover:bg-white/5',
      ].join(' ')}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
      aria-label={`Upload ${label}`}
    >
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleChange}
        capture="environment"
      />
      <div className="flex flex-col items-center gap-3">
        {file ? (
          <CheckCircle className="h-8 w-8 text-nabams-gold" />
        ) : (
          <div className="text-gray-400">{icon}</div>
        )}
        <div>
          <p className="font-medium text-gray-200">{label}</p>
          {file ? (
            <p className="mt-1 text-xs text-nabams-gold">
              ✓ {file.name} ({(file.size / 1024).toFixed(0)} KB)
            </p>
          ) : (
            <p className="mt-1 text-xs text-gray-500">
              Tap to take photo or choose file
            </p>
          )}
        </div>
        {!file && (
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <Upload className="h-3.5 w-3.5" />
            Max 5 MB — will be compressed automatically
          </span>
        )}
      </div>
    </div>
  );
}

export function AccreditationForm({ voterName }: { voterName: string }) {
  const [passport, setPassport] = useState<File | null>(null);
  const [idCard, setIdCard] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!passport || !idCard) {
      setError('Both your passport photo and ID card are required before you can vote.');
      return;
    }

    setLoading(true);
    const fd = new FormData();
    fd.set('passport', passport);
    fd.set('id_card', idCard);

    const result = await uploadVoterDocuments(fd);
    if (result?.error) {
      setError(result.error);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <p className="text-sm text-gray-300">
          Welcome, <strong className="text-white">{voterName}</strong>. Before accessing
          the ballot, please upload:
        </p>
        <ul className="mt-2 list-inside list-disc text-sm text-gray-400 space-y-1">
          <li>Your passport photograph</li>
          <li>Your student ID card</li>
        </ul>
        <p className="mt-2 text-xs text-gray-500">
          Images are compressed automatically. Accepted: JPG, PNG, HEIC.
        </p>
      </div>

      <FileUploadZone
        label="Passport Photograph"
        icon={<Camera className="h-8 w-8" />}
        id="passport"
        file={passport}
        onChange={setPassport}
      />

      <FileUploadZone
        label="Student ID Card"
        icon={<CreditCard className="h-8 w-8" />}
        id="id_card"
        file={idCard}
        onChange={setIdCard}
      />

      {error && (
        <div className="rounded-xl border border-red-700/50 bg-red-900/20 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <Button
        type="submit"
        fullWidth
        size="lg"
        loading={loading}
        disabled={loading || !passport || !idCard}
      >
        {loading ? 'Uploading…' : 'Upload & Proceed to Ballot'}
      </Button>
    </form>
  );
}
