'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, CreditCard, CheckCircle, Upload, Eye, EyeOff, Loader2 } from 'lucide-react';
import { completeAccreditation } from '@/app/actions/auth';

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
        'relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition duration-150',
        file
          ? 'border-sky-500 bg-sky-50/80'
          : 'border-sky-300 bg-sky-50/40 hover:bg-sky-50 hover:border-sky-400',
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
      <div className="flex flex-col items-center gap-2">
        {file ? (
          <CheckCircle className="h-8 w-8 text-sky-600" />
        ) : (
          <div className="text-sky-400">{icon}</div>
        )}
        <div>
          <p className={`font-medium text-sm ${file ? 'text-sky-900' : 'text-slate-700'}`}>{label}</p>
          {file ? (
            <p className="mt-0.5 text-xs text-sky-700">
              ✓ {file.name} ({(file.size / 1024).toFixed(0)} KB)
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-slate-500">Tap to take photo or choose file</p>
          )}
        </div>
        {!file && (
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <Upload className="h-3.5 w-3.5" />
            Max 5 MB — compressed automatically
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
  const [showPin, setShowPin] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);
    const pin = formData.get('voting_pin') as string;
    const confirmPin = formData.get('confirm_pin') as string;

    if (pin !== confirmPin) {
      setError('Your Voting PINs do not match. Please re-enter them.');
      return;
    }

    if (pin.length !== 4) {
      setError('Your Voting PIN must be exactly 4 digits.');
      return;
    }

    if (!passport || !idCard) {
      setError('Both your passport photo and ID card are required.');
      return;
    }

    setLoading(true);
    formData.set('passport', passport);
    formData.set('id_card', idCard);

    const result = await completeAccreditation(formData);
    if (result?.error) {
      setError(result.error);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <p className="text-sm text-slate-700">
          Welcome, <strong className="text-slate-900">{voterName}</strong>.
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Complete your profile and upload your documents to receive your digital ballot.
        </p>
      </div>

      {/* Contact & PIN */}
      <div className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="your.email@example.com"
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 transition duration-150"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone_number" className="text-sm font-medium text-slate-700">Phone Number</label>
          <input
            id="phone_number"
            name="phone_number"
            type="tel"
            placeholder="08012345678"
            inputMode="numeric"
            pattern="[0-9]+"
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 transition duration-150"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="voting_pin" className="text-sm font-medium text-slate-700">Create Voting PIN</label>
            <div className="relative">
              <input
                id="voting_pin"
                name="voting_pin"
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={4}
                pattern="[0-9]{4}"
                placeholder="4-digits"
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 transition duration-150 text-center tracking-widest text-base"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirm_pin" className="text-sm font-medium text-slate-700">Confirm PIN</label>
            <div className="relative">
              <input
                id="confirm_pin"
                name="confirm_pin"
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={4}
                pattern="[0-9]{4}"
                placeholder="4-digits"
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 transition duration-150 text-center tracking-widest text-base"
              />
              <button
                type="button"
                onClick={() => setShowPin((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
              >
                {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs text-sky-700 bg-sky-50 border border-sky-200 rounded-lg px-3 py-2">
          ⚠️ Remember your 4-digit PIN — you will need it to cast your vote if you return to the portal.
        </p>
      </div>

      {/* Documents */}
      <div className="space-y-4 pt-2 border-t border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">Document Uploads</h3>
        <FileUploadZone label="Passport Photograph" icon={<Camera className="h-8 w-8" />} id="passport" file={passport} onChange={setPassport} />
        <FileUploadZone label="Student ID Card" icon={<CreditCard className="h-8 w-8" />} id="id_card" file={idCard} onChange={setIdCard} />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 text-center">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !passport || !idCard}
        className="w-full flex items-center justify-center gap-2 py-3 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-medium rounded-lg shadow-sm transition duration-150 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 text-sm"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing…
          </>
        ) : 'Complete Accreditation'}
      </button>
    </form>
  );
}
