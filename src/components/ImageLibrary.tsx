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

  async function refresh() {
    const res = await fetch('/api/images');
    if (res.ok) {
      const { data } = await res.json();
      setImages(data || []);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/images/upload', { method: 'POST', body: form });
    setIsUploading(false);
    if (res.ok) {
      await refresh();
    }
    e.target.value = '';
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
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={isUploading} />
        </label>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {images.map((url) => (
          <Card key={url} className="overflow-hidden bg-neutral-900 border-neutral-800">
            <button onClick={() => onSelect(url)} className="block w-full">
              <CardContent className="p-0">
                <img src={url} alt="" className="w-full h-32 object-cover" />
              </CardContent>
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}


