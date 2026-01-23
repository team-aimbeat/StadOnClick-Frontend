
import { HiOutlineTrash, HiOutlineXMark } from "react-icons/hi2";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => Promise<void> | void;
  confirmLoading?: boolean;
};

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title = "Delete",
  description = "Are you sure you want to delete?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  confirmLoading = false,
}: Props) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="space-y-6">
        <DialogHeader className="items-center text-center">
          <div className="flex w-full justify-end">
            <DialogClose aria-label="Close">
              <HiOutlineXMark className="h-4 w-4" />
            </DialogClose>
          </div>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 shadow-sm">
            <HiOutlineTrash className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl font-semibold text-slate-900">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={confirmLoading}
          >
            {confirmLoading ? "Deleting…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
