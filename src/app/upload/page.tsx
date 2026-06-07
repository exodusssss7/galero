'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, Image as ImageIcon, X, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('video/')) {
      setError('Please select an image or video file.');
      return;
    }

    setFile(selectedFile);
    setError('');

    // Create preview
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
  };

  const clearSelection = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error uploading file.');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold">Upload to Gallery</h1>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          {!file ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 hover:border-indigo-400 transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="bg-indigo-50 p-4 rounded-full text-indigo-500 mb-4">
                <UploadCloud size={40} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Click to select a file</h3>
              <p className="text-gray-500 text-sm">Supports images and videos</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,video/*"
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                {file.type.startsWith('image/') ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={preview!} alt="Preview" className="max-h-full object-contain" />
                ) : (
                  <video src={preview!} controls className="max-h-full" />
                )}
                <button
                  onClick={clearSelection}
                  className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <ImageIcon className="text-gray-400 flex-shrink-0" size={24} />
                  <span className="truncate font-medium text-sm">{file.name}</span>
                </div>
                <span className="text-sm text-gray-500 flex-shrink-0 ml-4">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>

              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={20} />
                    <span>Upload to Gallery</span>
                  </>
                )}
              </button>
            </div>
          )}

          {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
        </div>
      </div>
    </div>
  );
}
