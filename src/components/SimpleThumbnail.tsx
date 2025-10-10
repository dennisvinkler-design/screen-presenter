import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ImageOff } from 'lucide-react';

interface SimpleThumbnailProps {
  src: string;
  alt: string;
  className?: string;
}

export function SimpleThumbnail({ src, alt, className }: SimpleThumbnailProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    if (!src) {
      setStatus('error');
      return;
    }

    setStatus('loading');
    const img = new Image();
    img.src = src;
    img.onload = () => setStatus('loaded');
    img.onerror = () => setStatus('error');

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  if (status === 'error') {
    return (
      <div className={cn('w-full h-full bg-neutral-800 flex items-center justify-center', className)}>
        <ImageOff className="h-6 w-6 text-neutral-600" />
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className={cn('w-full h-full bg-neutral-800 animate-pulse', className)} />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={cn('w-full h-full object-cover', className)}
      draggable={false}
    />
  );
}

