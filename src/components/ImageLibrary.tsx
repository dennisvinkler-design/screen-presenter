import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Image as ImageIcon, Upload } from 'lucide-react';

interface ImageLibraryProps {
  onSelect: (url: string) => void;
}

export function ImageLibrary({ onSelect }: ImageLibraryProps) {
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [cacheKey, setCacheKey] = useState(0);

  async function refresh() {
    const res = await fetch('/api/images');
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
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append('file', file);
        const res = await fetch('/api/images/upload', { method: 'POST', body: form });
        if (res.ok) {
          const { data } = await res.json();
          if (data?.url) uploadedUrls.push(data.url);
        }
      }
      if (uploadedUrls.length > 0) {
        // Optimistisk opdatering så billeder vises med det samme
        setImages((prev) => [...uploadedUrls, ...prev]);
        setCacheKey((k) => k + 1);
      }
      // Ekstra refresh efter et kort øjeblik for at fange eventuel forsinkelse i Storage-list
      setTimeout(() => { refresh(); }, 800);
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {images.map((url) => (
          <Card key={url} className="overflow-hidden bg-neutral-900 border-neutral-800">
            <button onClick={() => onSelect(url)} className="block w-full">
              <CardContent className="p-0">
                <img src={`${url}?v=${cacheKey}`} alt="" className="w-full h-32 object-cover" />
              </CardContent>
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}


