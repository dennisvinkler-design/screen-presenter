import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface ImageWithLoaderProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  containerClassName?: string;
}
export function ImageWithLoader({ src, alt, className, containerClassName, ...props }: ImageWithLoaderProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  useEffect(() => {
    setStatus('loading');
    if (!src) {
      setStatus('error');
      return;
    }
    const img = new Image();
    img.src = src;
    img.onload = () => setStatus('loaded');
    img.onerror = () => setStatus('error');
  }, [src]);
  return (
    <div className={cn('relative w-full h-full bg-neutral-800 overflow-hidden', containerClassName)}>
      <AnimatePresence>
        {status === 'loading' && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <Skeleton className="w-full h-full" />
          </motion.div>
        )}
        {status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-neutral-800/50"
          >
            <ImageOff className="h-1/3 w-1/3 text-neutral-600" />
          </motion.div>
        )}
        {status === 'loaded' && (
          <motion.img
            key="image"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            src={src}
            alt={alt}
            className={cn('w-full h-full object-cover', className)}
            {...(props as any)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}