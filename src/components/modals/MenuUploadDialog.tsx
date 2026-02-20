import * as React from 'react';
import { HiOutlinePhoto, HiOutlineVideoCamera, HiOutlineXMark } from 'react-icons/hi2';
import { Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { MenuMedia, useUploadServiceMenuMediaMutation } from '@/services/menuMediaApi';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: string;
  onUploaded?: (media: MenuMedia) => void;
};

export function MenuUploadDialog({ open, onOpenChange, serviceId, onUploaded }: Props) {
  const [title, setTitle] = React.useState('');
  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string>();
  const [error, setError] = React.useState<string>();

  const [uploadMenuMedia, { isLoading: isUploading }] = useUploadServiceMenuMediaMutation();

  React.useEffect(() => {
    if (!open) {
      setTitle('');
      setFile(null);
      setError(undefined);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(undefined);
      }
    }
  }, [open]);

  React.useEffect(() => {
    if (!file) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(undefined);
      }
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const selected = acceptedFiles[0];
    if (!selected) return;

    if (!selected.type.startsWith('image/') && !selected.type.startsWith('video/')) {
      setError('Only image or video files are allowed.');
      return;
    }

    if (selected.size > 100 * 1024 * 1024) {
      setError('File is too large (max 100MB).');
      return;
    }

    setError(undefined);
    setFile(selected);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'video/*': [],
    },
    maxFiles: 1,
    multiple: false,
  });

  const fileType = file?.type.startsWith('video/') ? 'video' : 'image';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Please select an image or video.');
      return;
    }

    if (!title.trim()) {
      setError('Please provide a title.');
      return;
    }

    setError(undefined);

    try {
      const media = await uploadMenuMedia({
        serviceId,
        file,
        title: title.trim(),
      }).unwrap();

      onUploaded?.(media);
      onOpenChange(false);
    } catch (err: any) {
      const msg = err?.data?.message || 'Upload failed. Please try again.';
      setError(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-115">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Upload Menu</DialogTitle>
            <DialogClose aria-label="Close" asChild>
              <button className="rounded-full p-1.5 transition-colors hover:bg-muted">
                <HiOutlineXMark className="h-5 w-5" />
              </button>
            </DialogClose>
          </div>
          <Label className="text-xs font-extrabold">Add menu images for customer preview.</Label>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-5 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Main Course"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label>Menu file</Label>
            <div
              {...getRootProps()}
              className={cn(
                'group relative flex h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition',
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-muted/40 hover:border-primary/50 hover:bg-muted/60',
                file ? 'border-primary/40 bg-primary/5' : '',
              )}
            >
              <input {...getInputProps()} />

              {!file ? (
                <>
                  <div className="mb-3 rounded-full bg-background p-3 shadow-sm transition group-hover:scale-105">
                    {isDragActive ? (
                      <HiOutlineVideoCamera className="h-7 w-7 text-primary" />
                    ) : (
                      <HiOutlinePhoto className="h-7 w-7 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {isDragActive ? 'Drop file here' : 'Drag & drop or click to browse'}
                  </p>
                  <p className="mt-1.5 text-xs text-muted-foreground">Image or video (max 100MB)</p>
                </>
              ) : (
                <div className="flex flex-col items-center px-4 text-center">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(1)} MB · {fileType}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 h-8 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                  >
                    Remove file
                  </Button>
                </div>
              )}
            </div>
          </div>

          {previewUrl && (
            <div className="animate-in space-y-2 fade-in-60 duration-300">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Preview · {fileType}
              </p>
              <div className="relative aspect-video overflow-hidden rounded-xl border bg-muted">
                {fileType === 'video' ? (
                  <video src={previewUrl} className="h-full w-full object-cover" controls muted />
                ) : (
                  <img src={previewUrl} alt="Menu preview" className="h-full w-full object-cover" />
                )}
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}

          <DialogFooter className="gap-3 sm:gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading || !file || !title.trim()} className="min-w-35">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload Menu'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

