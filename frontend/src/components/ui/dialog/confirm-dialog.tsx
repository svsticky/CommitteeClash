'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog/dialog';
import { ReactNode, useState } from 'react';

type ConfirmDialogProps = {
  title?: string;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirmAction: () => void | Promise<void>;
  children: ReactNode; // trigger button
  disabled?: boolean;
};

export function ConfirmDialog({
  title = 'Weet je het zeker?',
  description = 'Deze actie kan niet ongedaan gemaakt worden.',
  confirmText = 'Bevestig',
  cancelText = 'Annuleer',
  onConfirmAction,
  children,
  disabled = false,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    await onConfirmAction();
    setIsLoading(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div>{children}</div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div>{description}</div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-red-500 hover:bg-red-600"
            disabled={isLoading || disabled}
          >
            {isLoading ? 'Even geduld...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
