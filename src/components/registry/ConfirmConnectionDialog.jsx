import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

export default function ConfirmConnectionDialog({ app, onConfirm, onCancel }) {
  const [step, setStep] = useState(1);

  const handleStep1Confirm = () => {
    setStep(2);
  };

  const handleStep2Success = () => {
    onConfirm();
    setStep(1);
  };

  const handleCancel = () => {
    setStep(1);
    onCancel();
  };

  return (
    <>
      {step === 1 && (
        <AlertDialog open={true}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Prompt Entry</AlertDialogTitle>
              <AlertDialogDescription>
                Have you entered the connection prompt into {app.app_name}'s Base44 chat?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleStep1Confirm}>OK</AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {step === 2 && (
        <AlertDialog open={true}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Test Connection</AlertDialogTitle>
              <AlertDialogDescription>
                Have you tested that the Beacon Hub Control Panel is connected to {app.app_name}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex flex-col gap-2">
              <Button onClick={handleStep2Success} className="w-full">
                Yes, the control panel works with the {app.app_name} app
              </Button>
              <Button variant="outline" onClick={handleCancel} className="w-full">
                Yes, but the control panel is not connected to {app.app_name}
              </Button>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}