import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Transaction } from '@/types';

interface EditTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (transaction: Transaction) => Promise<void>;
  editingTransaction: Transaction | null;
  categories: any[];
  methods: any[];
  storages: any[];
}

export function EditTransactionDialog({
  open,
  onOpenChange,
  onSubmit,
  editingTransaction,
  categories,
  methods,
  storages
}: EditTransactionDialogProps) {
  const [formData, setFormData] = useState<Transaction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        ...editingTransaction,
        transactionDate: editingTransaction.transactionDate
          ? new Date(editingTransaction.transactionDate)
          : "",
        invoiceDate: editingTransaction.invoiceDate
          ? new Date(editingTransaction.invoiceDate)
          : ""
      });
    }
  }, [editingTransaction]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Transaction ID (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="tcid">Transaction ID</Label>
              <Input
                id="tcid"
                value={formData.tcid || ''}
                readOnly
                disabled
                className="bg-gray-100"
              />
            </div>

             {/* Transaction Date */}
             <div className="space-y-2">
              <Label htmlFor="transactionDate">Transaction Date</Label>
              <Input
                id="transactionDate"
                type="date"
                value={
                  formData.transactionDate
                    ? new Date(formData.transactionDate)
                        .toISOString()
                        .split('T')[0]
                    : ''
                }
                onChange={(e) =>
                  handleChange('transactionDate', e.target.value)
                }
              />
            </div>


            {/* Transaction Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type</Label>
              <Select
                value={formData.transactionType || ''}
                onValueChange={(value) =>
                  handleChange('transactionType', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inflow" className='hover:bg-black hover:text-white'>Inflow</SelectItem>
                  <SelectItem value="outflow" className='hover:bg-black hover:text-white'>Outflow</SelectItem>
                </SelectContent>
              </Select>
            </div>

             {/* Transaction Category */}
             <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.transactionCategory?._id || ''}
                onValueChange={(value) => {
                  const category = categories.find((cat) => cat._id === value);
                  handleChange('transactionCategory', category);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter(
                      (category) => category.type === formData.transactionType
                    ) // Filters based on type
                    .map((category) => (
                      <SelectItem key={category._id} value={category._id} className='hover:bg-black hover:text-white'>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

           

            {/* Transaction Method */}
            <div className="space-y-2">
              <Label htmlFor="method">Payment Method</Label>
              <Select
                value={formData.transactionMethod?._id || ''}
                onValueChange={(value) => {
                  const method = methods.find((m) => m._id === value);
                  handleChange('transactionMethod', method);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {methods.map((method) => (
                    <SelectItem key={method._id} value={method._id} className='hover:bg-black hover:text-white'>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Storage */}
            <div className="space-y-2">
              <Label htmlFor="storage">Storage</Label>
              <Select
                value={formData.storage?._id || ''}
                onValueChange={(value) => {
                  const storage = storages.find((s) => s._id === value);
                  handleChange('storage', storage);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select storage" />
                </SelectTrigger>
                <SelectContent>
                  {storages.map((storage) => (
                    <SelectItem key={storage._id} value={storage._id} className='hover:bg-black hover:text-white'>
                      {storage.storageName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            
            {/* Transaction Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={formData.transactionAmount || ''}
                onChange={(e) =>
                  handleChange('transactionAmount', parseFloat(e.target.value))
                }
              />
            </div>

           

            {/* Description */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="details">Details</Label>
              <Input
                id="details"
                value={formData.details || ''}
                onChange={(e) => handleChange('details', e.target.value)}
              />
            </div>

            {/* Details */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
              />
            </div>

            {/* Invoice Number */}
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber || ''}
                onChange={(e) => handleChange('invoiceNumber', e.target.value)}
              />
            </div>

            {/* Invoice Date */}
            <div className="space-y-2">
              <Label htmlFor="invoiceDate">Invoice Date</Label>
              <Input
                id="invoiceDate"
                type="date"
                value={
                  formData.invoiceDate
                    ? new Date(formData.invoiceDate).toISOString().split('T')[0]
                    : ''
                }
                onChange={(e) => handleChange('invoiceDate', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="theme" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
