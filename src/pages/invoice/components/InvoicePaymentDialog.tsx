import { useEffect, useMemo, useRef, useState } from 'react';
import Select from 'react-select';
import { FileUp, Paperclip, X } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCurrency } from '@/hooks/useCurrency';
import {
  FieldError,
  FieldErrors,
  paymentFormSchema,
  validateWithSchema
} from './invoice-form-validation';

const MAX_DOC_SIZE = 2 * 1024 * 1024; // 2MB, same limit as the other uploaders

// Flattens the category tree into indented react-select options
const buildCategoryOptions = (categories: any[], type: string) => {
  const filtered = categories.filter((category) => category.type === type);
  const childrenOf = new Map<string, any[]>();
  const roots: any[] = [];

  filtered.forEach((category) => {
    const parentId = category.parentId;
    const hasParent =
      parentId &&
      parentId !== 'none' &&
      filtered.some((item) => item._id === parentId);

    if (hasParent) {
      childrenOf.set(parentId, [...(childrenOf.get(parentId) || []), category]);
    } else {
      roots.push(category);
    }
  });

  const options: { label: string; value: string }[] = [];
  const walk = (nodes: any[], level: number) => {
    nodes.forEach((node) => {
      options.push({
        value: node._id,
        label: `${' '.repeat(level * 2)}${level > 0 ? '└─ ' : ''}${node.name}`
      });
      walk(childrenOf.get(node._id) || [], level + 1);
    });
  };
  walk(roots, 0);

  return options;
};

const toDateInput = (value?: string | Date) =>
  value ? new Date(value).toISOString().split('T')[0] : '';

const getId = (value: any) =>
  value && typeof value === 'object' ? value._id : value || '';

export function InvoicePaymentDialog({
  open,
  onOpenChange,
  invoice,
  categories,
  methods,
  storages,
  editingPayment,
  onSaved
}) {
  const { symbol } = useCurrency();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    transactionDate: '',
    transactionAmount: '',
    transactionCategory: '',
    transactionMethod: '',
    storage: '',
    invoiceNumber: '',
    invoiceDate: '',
    description: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const transactionType = invoice?.transactionType || 'inflow';

  const categoryOptions = useMemo(
    () => buildCategoryOptions(categories || [], transactionType),
    [categories, transactionType]
  );
  const methodOptions = useMemo(
    () =>
      (methods || []).map((method: any) => ({
        label: method.name,
        value: method._id
      })),
    [methods]
  );
  const storageOptions = useMemo(
    () =>
      (storages || []).map((storage: any) => ({
        label: storage.storageName,
        value: storage._id
      })),
    [storages]
  );

  // Balance that is still open, ignoring the payment currently being edited
  const outstanding = useMemo(() => {
    const balanceDue = Number(invoice?.balanceDue) || 0;
    const editingAmount = Number(editingPayment?.transactionAmount) || 0;
    return Math.max(0, balanceDue + editingAmount);
  }, [invoice, editingPayment]);

  useEffect(() => {
    if (!open) return;

    if (editingPayment) {
      setForm({
        transactionDate: toDateInput(editingPayment.transactionDate),
        transactionAmount: String(editingPayment.transactionAmount ?? ''),
        transactionCategory: getId(editingPayment.transactionCategory),
        transactionMethod: getId(editingPayment.transactionMethod),
        storage: getId(editingPayment.storage),
        invoiceNumber: editingPayment.invoiceNumber || '',
        invoiceDate: toDateInput(editingPayment.invoiceDate),
        description: editingPayment.description || ''
      });
    } else {
      setForm({
        transactionDate: new Date().toISOString().split('T')[0],
        transactionAmount: outstanding > 0 ? String(outstanding) : '',
        transactionCategory: '',
        transactionMethod: '',
        storage: '',
        invoiceNumber: invoice?.invoiceNumber || invoice?.invId || '',
        invoiceDate: toDateInput(invoice?.invoiceDate),
        description: ''
      });
    }

    setFile(null);
    setErrors({});
    setIsConfirmOpen(false);
    // Only re-seed when the dialog opens or switches payment, so typing is
    // never wiped out by a re-render of the invoice page behind it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingPayment?._id]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear the message as soon as the field is touched again
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const amount = Number(form.transactionAmount) || 0;
  const remainingAfterPayment = Math.max(0, outstanding - amount);
  const willBeFullyPaid = amount > 0 && remainingAfterPayment <= 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > MAX_DOC_SIZE) {
      toast({
        title: 'File size exceeds the 2MB limit',
        variant: 'destructive'
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setFile(selected);
  };

  const validate = () => {
    const result = validateWithSchema(paymentFormSchema, form);
    setErrors(result.errors);
    return result.success;
  };

  const handleReview = () => {
    if (!invoice?._id) {
      toast({ title: 'Invoice is not loaded yet', variant: 'destructive' });
      return;
    }
    if (!validate()) return;
    setIsConfirmOpen(true);
  };

  // The document is attached after the transaction exists, so the upload can
  // write the URL straight onto that transaction's transactionDoc field.
  const uploadDocument = async (transactionId: string) => {
    if (!file || !transactionId) return;

    const formData = new FormData();
    formData.append('entityId', transactionId);
    formData.append('file_type', 'transaction');
    formData.append('file', file);

    await axiosInstance.post('/documents', formData);
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setIsConfirmOpen(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        transactionDate: new Date(form.transactionDate).toISOString(),
        transactionAmount: amount,
        transactionCategory: form.transactionCategory,
        transactionMethod: form.transactionMethod,
        storage: form.storage,
        invoiceNumber: form.invoiceNumber || undefined,
        invoiceDate: form.invoiceDate
          ? new Date(form.invoiceDate).toISOString()
          : undefined,
        description: form.description || undefined
      };

      const response = editingPayment
        ? await axiosInstance.patch(
            `/invoice/${invoice._id}/payments/${editingPayment._id}`,
            payload
          )
        : await axiosInstance.post(`/invoice/${invoice._id}/payments`, payload);

      const savedTransaction = response.data?.data?.transaction;

      if (file) {
        try {
          await uploadDocument(savedTransaction?._id);
        } catch (uploadError) {
          console.error('Error uploading payment document:', uploadError);
          toast({
            title: 'Payment saved, but the document upload failed',
            variant: 'destructive'
          });
        }
      }

      toast({
        title: editingPayment
          ? 'Payment updated successfully'
          : 'Payment recorded successfully',
        className: 'bg-theme text-white border-none'
      });

      setIsConfirmOpen(false);
      onOpenChange(false);
      await onSaved?.();
    } catch (err: any) {
      console.error('Error saving payment:', err);
      toast({
        title:
          err?.response?.data?.message ||
          (editingPayment
            ? 'Failed to update payment'
            : 'Failed to record payment'),
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle>
              {editingPayment ? 'Edit Payment' : 'Make Payment'}
            </DialogTitle>
            <DialogDescription>
              This payment is recorded as an{' '}
              <span className="font-semibold">{transactionType}</span>{' '}
              transaction for invoice{' '}
              <span className="font-semibold">
                {invoice?.invoiceNumber || invoice?.invId}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="paymentDate">Transaction Date*</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={form.transactionDate}
                  onChange={(e) =>
                    handleChange('transactionDate', e.target.value)
                  }
                />
                <FieldError message={errors.transactionDate} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Amount*</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.transactionAmount}
                  onChange={(e) =>
                    handleChange('transactionAmount', e.target.value)
                  }
                />
                <FieldError message={errors.transactionAmount} />
              </div>
              <div className="space-y-2">
                <Label>Category* ({transactionType})</Label>
                <Select
                  options={categoryOptions}
                  value={
                    categoryOptions.find(
                      (option) => option.value === form.transactionCategory
                    ) || null
                  }
                  onChange={(option: any) =>
                    handleChange('transactionCategory', option?.value || '')
                  }
                  placeholder={`Select ${transactionType} category`}
                  menuPlacement="auto"
                />
                <FieldError message={errors.transactionCategory} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Method*</Label>
                <Select
                  options={methodOptions}
                  value={
                    methodOptions.find(
                      (option) => option.value === form.transactionMethod
                    ) || null
                  }
                  onChange={(option: any) =>
                    handleChange('transactionMethod', option?.value || '')
                  }
                  placeholder="Select method"
                  menuPlacement="auto"
                />
                <FieldError message={errors.transactionMethod} />
              </div>
              <div className="space-y-2">
                <Label>Storage*</Label>
                <Select
                  options={storageOptions}
                  value={
                    storageOptions.find(
                      (option) => option.value === form.storage
                    ) || null
                  }
                  onChange={(option: any) =>
                    handleChange('storage', option?.value || '')
                  }
                  placeholder="Select storage"
                  menuPlacement="auto"
                />
                <FieldError message={errors.storage} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="paymentInvoiceNumber">Invoice Number</Label>
                <Input
                  id="paymentInvoiceNumber"
                  value={form.invoiceNumber}
                  onChange={(e) =>
                    handleChange('invoiceNumber', e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentInvoiceDate">Invoice Date</Label>
                <Input
                  id="paymentInvoiceDate"
                  type="date"
                  value={form.invoiceDate}
                  onChange={(e) => handleChange('invoiceDate', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDescription">Description</Label>
              <Textarea
                id="paymentDescription"
                placeholder="Enter description"
                className="min-h-[60px] resize-none border-gray-200"
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDoc">Document</Label>
              <div className="flex flex-wrap items-center gap-3">
                <Input
                  id="paymentDoc"
                  ref={fileInputRef}
                  type="file"
                  className="max-w-[320px] cursor-pointer"
                  onChange={handleFileChange}
                />
                {file && (
                  <span className="flex items-center gap-2 text-sm text-black">
                    <FileUp className="h-4 w-4" />
                    {file.name}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-500 hover:text-red-500"
                      onClick={() => {
                        setFile(null);
                        if (fileInputRef.current)
                          fileInputRef.current.value = '';
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </span>
                )}
                {!file && editingPayment?.transactionDoc && (
                  <a
                    href={editingPayment.transactionDoc}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-500 underline"
                  >
                    <Paperclip className="h-4 w-4" />
                    View current document
                  </a>
                )}
              </div>
              <p className="text-xs text-black">
                Max 2MB. Uploading a new document replaces the one attached to
                this transaction.
              </p>
            </div>

            <div className="rounded-md bg-gray-50 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-black">Invoice Total</span>
                <span className="font-medium">
                  {symbol}
                  {(Number(invoice?.total) || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-black">Outstanding Balance</span>
                <span className="font-medium">
                  {symbol}
                  {outstanding.toFixed(2)}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between border-t border-gray-200 pt-1">
                <span className="text-black">Balance After Payment</span>
                <span className="font-bold text-theme">
                  {symbol}
                  {remainingAfterPayment.toFixed(2)}
                </span>
              </div>
              {willBeFullyPaid && (
                <p className="mt-2 text-xs font-semibold text-green-600">
                  This invoice will be marked as Paid.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="theme" onClick={handleReview}>
              {editingPayment ? 'Update Payment' : 'Mark as Paid'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRMATION */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>
              {editingPayment ? 'Confirm Payment Update' : 'Confirm Payment'}
            </DialogTitle>
            <DialogDescription>
              {editingPayment
                ? 'The linked transaction and the invoice balance will be updated.'
                : 'A transaction will be created and the invoice balance will be updated.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1 rounded-md bg-gray-50 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-black">Amount</span>
              <span className="font-semibold">
                {symbol}
                {amount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-black">Date</span>
              <span className="font-semibold">{form.transactionDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black">Type</span>
              <span className="font-semibold capitalize">
                {transactionType}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-black">Invoice Status</span>
              <span className="font-semibold">
                {willBeFullyPaid ? 'Paid' : 'Partial'}
              </span>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setIsConfirmOpen(false)}
            >
              Back
            </Button>
            <Button
              variant="theme"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting
                ? 'Saving...'
                : editingPayment
                  ? 'Confirm Update'
                  : 'Confirm & Mark as Paid'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
