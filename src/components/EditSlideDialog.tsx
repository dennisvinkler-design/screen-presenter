import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePresentationStore } from '@/store/presentationStore';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import { ImageLibrary } from '@/components/ImageLibrary';
interface Slide {
  images: [string, string, string, string];
}
interface EditSlideDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  slide: Slide | null;
  slideIndex: number | null;
}
export function EditSlideDialog({ isOpen, onOpenChange, slide, slideIndex }: EditSlideDialogProps) {
  const [imageUrls, setImageUrls] = useState<[string, string, string, string]>(['', '', '', '']);
  const { updateSlideImages, isUpdating } = usePresentationStore();
  useEffect(() => {
    if (slide) {
      setImageUrls(slide.images);
    }
  }, [slide]);
  const handleSave = async () => {
    if (slideIndex !== null) {
      await updateSlideImages(slideIndex, imageUrls);
      onOpenChange(false);
    }
  };
  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...imageUrls] as [string, string, string, string];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[980px] bg-neutral-900 border-neutral-800 text-neutral-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">Edit Slide {slideIndex !== null ? slideIndex + 1 : ''}</DialogTitle>
          <DialogDescription className="text-neutral-400">
            Update the image URLs for each screen. Changes will be saved to the server.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {imageUrls.map((url, index) => (
                <div key={index} className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={`url-${index}`} className="text-right text-neutral-400">
                    Screen {index + 1}
                  </Label>
                  <Input
                    id={`url-${index}`}
                    value={url}
                    onChange={(e) => handleUrlChange(index, e.target.value)}
                    className="col-span-3 bg-neutral-800 border-neutral-700 focus:ring-blue-500 text-neutral-200"
                    placeholder="Paste image URL or pick from library"
                  />
                </div>
              ))}
            </div>
            <div className="border border-neutral-800 rounded-md p-3">
              {isOpen && (
                <ImageLibrary onSelect={(url) => {
                  const firstEmpty = imageUrls.findIndex((u) => !u);
                  const slot = firstEmpty === -1 ? 0 : firstEmpty;
                  handleUrlChange(slot, url);
                }} />
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isUpdating}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-50"
          >
            {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}