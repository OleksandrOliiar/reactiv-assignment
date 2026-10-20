import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Spinner } from '@/shared/ui/spinner';

type SaveConflictDialogProps = {
  open: boolean;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onReload: () => void;
  onOverwrite: () => void;
};

export function SaveConflictDialog({
  open,
  pending,
  onOpenChange,
  onReload,
  onOverwrite,
}: SaveConflictDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>This screen was saved somewhere else</DialogTitle>
          <DialogDescription>
            Reload the latest version, or overwrite it with the draft open in this editor.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" disabled={pending} onClick={onReload}>
            {pending ? <Spinner /> : null}
            Reload latest
          </Button>
          <Button type="button" disabled={pending} onClick={onOverwrite}>
            Overwrite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
