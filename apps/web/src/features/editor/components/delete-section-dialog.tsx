import {
  AlertDialog,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/shared/ui/alert-dialog';
import { useEditorActions } from './editor-store-provider';

export function DeleteSectionDialog({
  sectionId,
  title,
  open,
  onOpenChange,
}: {
  sectionId: string;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { removeSection } = useEditorActions();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this section?</AlertDialogTitle>
          <AlertDialogDescription>
            {title} will be removed from the draft. Discard changes to bring it back before saving.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={() => removeSection(sectionId)}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
