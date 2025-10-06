import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Image as ImageIcon, Upload } from 'lucide-react';

interface ImageLibraryProps {
  onSelect: (url: string) => void;
}

export function ImageLibrary({ onSelect }: ImageLibraryProps) {
  type FileRow = { name: string; url: string };
  const [images, setImages] = useState<FileRow[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [cacheKey, setCacheKey] = useState(0);

  async function refresh() {
    const res = await fetch('/api/images', { cache: 'no-store' });
    if (res.ok) {
      const { data } = await res.json();
      setImages(data || []);
      setCacheKey((k) => k + 1);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const uploaded: FileRow[] = [];
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append('file', file);
        const res = await fetch('/api/images/upload', { method: 'POST', body: form });
        if (res.ok) {
          const { data } = await res.json();
          if (data?.url) uploaded.push({ name: data.url.split('/').pop() || data.url, url: data.url });
          // Optimistisk: tilføj efter hvert enkelt upload
          setImages((prev) => [{ name: data.url.split('/').pop() || data.url, url: data.url }, ...prev]);
          setCacheKey((k) => k + 1);
        }
      }
      // Ekstra refresh efter kort tid for at fange eventual consistent listing
      setTimeout(() => { refresh(); }, 400);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-neutral-400">
          <ImageIcon className="h-5 w-5" />
          <span>Image library</span>
        </div>
        <label className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-neutral-800 hover:bg-neutral-700 cursor-pointer">
          <Upload className="h-4 w-4" /> Upload
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={isUploading} />
        </label>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-[560px] overflow-auto pr-1">
        {images.map((f) => (
          <Card key={f.url} className="overflow-hidden bg-neutral-900 border-neutral-800 group relative">
            <button
              onClick={() => onSelect(f.url)}
              className="block w-full"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/uri-list', f.url);
                e.dataTransfer.setData('text/plain', f.url);
                e.dataTransfer.effectAllowed = 'copy';
              }}
            >
              <CardContent className="p-0">
                <div className="w-full aspect-[4/3] bg-neutral-800">
                  <img src={`${f.url}?v=${cacheKey}`} alt="" className="w-full h-full object-contain" draggable={false} />
                </div>
              </CardContent>
            </button>
            <button
              className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white opacity-0 group-hover:opacity-100"
              onClick={async (e) => {
                e.stopPropagation();
                await fetch(`/api/images?name=${encodeURIComponent(f.name)}`, { method: 'DELETE' });
                setImages((prev) => prev.filter((x) => x.name !== f.name));
              }}
            >
              Delete
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}


