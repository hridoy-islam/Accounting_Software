import { Controller, useForm } from 'react-hook-form';
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
import { useParams } from 'react-router-dom';
import { usePermission } from '@/hooks/usePermission';

export function CustomerDialog({ open, onOpenChange, onSubmit, initialData }) {
  const { id } = useParams();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      address: '',
      phone: '',
      companyId: id,
      bankName: '',
      accountNo: '',
      sortCode: '',
      beneficiary: ''
    }
  });

  const { hasPermission } = usePermission();

  useEffect(() => {
    if (open) {
      reset();
    }

    return () => {
      if (!open) {
        reset();
      }
    };
  }, [open, reset]);

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name ?? '',
        email: initialData.email ?? '',
        address: initialData.address ?? '',
        phone: initialData.phone ?? '',
        bankName: initialData.bankName ?? '',
        accountNo: initialData.accountNo ?? '',
        sortCode: initialData.sortCode ?? '',
        beneficiary: initialData.beneficiary ?? ''
      });
    }
  }, [initialData, reset]);

  const onSubmitForm = (data) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Customer' : 'Add New Customer'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium">
                Customer Name *
              </label>
              <Input
                {...register('name', { required: 'Customer Name is required' })}
                placeholder="Customer Name"
              />
              <ErrorMessage message={errors.name?.message?.toString()} />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium">Email</label>
              <Input
                {...register('email', {
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email format'
                  }
                })}
                placeholder="Email"
              />
              <ErrorMessage message={errors.email?.message?.toString()} />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium">Phone</label>
              <Input {...register('phone')} placeholder="Phone" />
              <ErrorMessage message={errors.phone?.message?.toString()} />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium">Address</label>
              <Input {...register('address')} placeholder="Address" />
              <ErrorMessage message={errors.address?.message?.toString()} />
            </div>

            {/* Bank Name */}
            <div>
              <label className="block text-sm font-medium">Bank Name *</label>
              <Input
                {...register('bankName', { required: 'Bank Name is required' })}
                placeholder="Bank Name"
              />
              <ErrorMessage message={errors.bankName?.message?.toString()} />
            </div>

            {/* Account No */}
            <div>
              <label className="block text-sm font-medium">Account No *</label>
              <Input
                {...register('accountNo', {
                  required: 'Account Number is required'
                })}
                placeholder="Account Number"
              />
              <ErrorMessage message={errors.accountNo?.message?.toString()} />
            </div>

            {/* Sort Code */}
            <div>
              <label className="block text-sm font-medium">Sort Code *</label>
              <Input
                {...register('sortCode', { required: 'Sort Code is required' })}
                placeholder="Sort Code"
              />
              <ErrorMessage message={errors.sortCode?.message?.toString()} />
            </div>

            {/* Beneficiary */}
            <div>
              <label className="block text-sm font-medium">Beneficiary</label>
              <Input {...register('beneficiary')} placeholder="Beneficiary" />
              <ErrorMessage message={errors.beneficiary?.message?.toString()} />
            </div>
          </div>

          {hasPermission('Customer', 'create') && (
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="theme">
                {initialData ? 'Save Changes' : 'Add Customer'}
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
