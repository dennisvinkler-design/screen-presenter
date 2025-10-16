import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Image as ImageIcon, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { useImageStore } from '@/store/imageStore';

interface ImageLibraryProps {
  onSelect: (url: string) => void;
}

export function ImageLibrary({ onSelect }: ImageLibraryProps) {
  const { images, refreshImages, addImage, removeImage } = useImageStore();
  const [isUploading, setIsUploading] = useState(false);
  const [cacheKey, setCacheKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 20;

  // Calculate pagination
  const totalPages = Math.ceil(images.length / itemsPerPage);
  const paginatedImages = useMemo(() => {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    return images.slice(start, end);
  }, [images, currentPage, itemsPerPage]);

  // Reset to first page when images change
  useEffect(() => {
    setCurrentPage(0);
  }, [images.length]);

  // Lazy loading image component with proper cleanup
  const LazyImage = useCallback(({ src, alt, className }: { src: string; alt: string; className: string }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);
    
    const imgRef = useCallback((node: HTMLDivElement | null) => {
      // Cleanup previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (node) {
        observerRef.current = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observerRef.current?.disconnect();
            }
          },
          { threshold: 0.1 }
        );
        observerRef.current.observe(node);
      }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        observerRef.current?.disconnect();
      };
    }, []);

    return (
      <div ref={imgRef} className={className}>
        {isInView && (
          <img
            src={src}
            alt={alt}
            className={`w-full h-full object-contain transition-opacity duration-200 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setIsLoaded(true)}
            draggable={false}
          />
        )}
        {!isLoaded && isInView && (
          <div className="w-full h-full bg-neutral-800 animate-pulse flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-neutral-600" />
          </div>
        )}
      </div>
    );
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append('file', file);
        const res = await fetch('/api/images/upload', { method: 'POST', body: form });
        if (res.ok) {
          const { data } = await res.json();
          if (data?.url) {
            const newImage = { name: data.url.split('/').pop() || data.url, url: data.url };
            addImage(newImage);
            setCacheKey(Date.now()); // Use timestamp for new uploads only
          }
        }
      }
      // Ekstra refresh efter kort tid for at fange eventual consistent listing
      setTimeout(() => { refreshImages(); }, 400);
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
        {paginatedImages.map((f) => (
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
                <LazyImage 
                  src={`${f.url}?v=${cacheKey}`} 
                  alt="" 
                  className="w-full aspect-[4/3] bg-neutral-800" 
                />
              </CardContent>
            </button>
            <button
              className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white opacity-0 group-hover:opacity-100"
              onClick={async (e) => {
                e.stopPropagation();
                await fetch(`/api/images?name=${encodeURIComponent(f.name)}`, { method: 'DELETE' });
                removeImage(f.name);
              }}
            >
              Delete
            </button>
          </Card>
        ))}
      </div>
      
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-neutral-400">
            Showing {currentPage * itemsPerPage + 1}-{Math.min((currentPage + 1) * itemsPerPage, images.length)} of {images.length} images
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-neutral-400 px-3">
              {currentPage + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}
              className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}


