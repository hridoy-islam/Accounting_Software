import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ErrorMessage from '@/components/shared/error-message';
import { useEffect } from 'react';

export function BankDialog({ open, onOpenChange, onSubmit, initialData }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      accountNo: '',
      sortCode: '',
      beneficiary: ''
    }
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          name: initialData.name ?? '',
          accountNo: initialData.accountNo ?? '',
          sortCode: initialData.sortCode ?? '',
          beneficiary: initialData.beneficiary ?? ''
        });
      } else {
        reset({ name: '', accountNo: '', sortCode: '', beneficiary: '' });
      }
    }
  }, [open, initialData, reset]);

  const onSubmitForm = (data) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Bank Account' : 'Add New Bank Account'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Bank Name *</label>
              <Input
                {...register('name', { required: 'Bank Name is required' })}
                placeholder="e.g. Barclays"
              />
              <ErrorMessage message={errors.name?.message?.toString()} />
            </div>

            <div>
              <label className="block text-sm font-medium">Account Number *</label>
              <Input
                {...register('accountNo', { required: 'Account Number is required' })}
                placeholder="e.g. 12345678"
              />
              <ErrorMessage message={errors.accountNo?.message?.toString()} />
            </div>

            <div>
              <label className="block text-sm font-medium">Sort Code *</label>
              <Input
                {...register('sortCode', { required: 'Sort Code is required' })}
                placeholder="e.g. 12-34-56"
              />
              <ErrorMessage message={errors.sortCode?.message?.toString()} />
            </div>

            <div>
              <label className="block text-sm font-medium">Beneficiary *</label>
              <Input
                {...register('beneficiary', { required: 'Beneficiary is required' })}
                placeholder="e.g. Company Ltd"
              />
              <ErrorMessage message={errors.beneficiary?.message?.toString()} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-theme text-white">
              {initialData ? 'Save Changes' : 'Add Bank'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}