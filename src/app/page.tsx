'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Plus, Image as ImageIcon, LogOut, Loader2, Play } from 'lucide-react';
import { logout } from './login/actions';
import { useRouter } from 'next/navigation';

type MediaItem = {
  name: string;
  url: string;
  type: 'image' | 'video';
  created_at: string;
};

export default function GalleryPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const { data, error: fetchError } = await supabase.storage.from('gallery').list();

        if (fetchError) {
          throw fetchError;
        }

        const mediaItems: MediaItem[] = await Promise.all(
          (data || [])
            .filter((item) => item.name !== '.emptyFolderPlaceholder')
            .map(async (item) => {
              const { data: urlData } = supabase.storage
                .from('gallery')
                .getPublicUrl(item.name);

              // Determine type by extension
              const isVideo = item.name.match(/\.(mp4|webm|ogg|mov)$/i);

              return {
                name: item.name,
                url: urlData.publicUrl,
                type: isVideo ? 'video' : 'image',
                created_at: item.created_at || new Date().toISOString(),
              };
            })
        );

        // Sort by newest first
        mediaItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setItems(mediaItems);
      } catch (err: unknown) {
        console.error(err);
        setError('Failed to load gallery. Make sure Supabase credentials are set and the "gallery" bucket exists and is public.');
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center space-x-2">
            <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
              <ImageIcon size={20} />
            </span>
            <span>Private Gallery</span>
          </h1>
          <div className="flex items-center space-x-4">
            <Link 
              href="/upload"
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Upload</span>
            </Link>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Lock Gallery"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 space-y-4">
            <Loader2 className="animate-spin" size={40} />
            <p>Loading your memories...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 text-center">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 space-y-4 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
            <div className="bg-gray-50 p-4 rounded-full">
              <ImageIcon size={32} />
            </div>
            <p className="text-lg">Your gallery is empty</p>
            <Link 
              href="/upload"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Upload your first photo or video
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((item) => (
              <div 
                key={item.name} 
                className="group relative aspect-square bg-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {item.type === 'image' ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img 
                    src={item.url} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <video 
                      src={item.url} 
                      className="w-full h-full object-cover"
                      preload="metadata"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors pointer-events-none">
                      <div className="bg-white/90 p-3 rounded-full text-gray-900 shadow-lg">
                        <Play size={20} className="ml-1" />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Overlay with options */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 pointer-events-none">
                  <span className="text-white text-xs truncate drop-shadow-md">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                {/* Full screen link */}
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="absolute inset-0 z-10"
                  aria-label={`View ${item.type}`}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
