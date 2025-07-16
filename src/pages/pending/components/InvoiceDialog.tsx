import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import type { Invoice } from '@/types/invoice';
import { Input } from '@/components/ui/input';
import moment from 'moment';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { toast } from '@/components/ui/use-toast';

export function InvoiceDialog({
  invoice,
  open,
  onClose,
  setInvoices
  // onConfirm
}) {
  const [categories, setCategories] = useState([]);
  const [methods, setMethods] = useState([]);
  const [storages, setStorages] = useState([]);
  const { id } = useParams();

  const form = useForm({
    defaultValues: {
      method: '',
      category: '',
      storage: '',
      transactionDate: undefined,
      details: ''
    }
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, methodsRes, storagesRes] = await Promise.all([
          axiosInstance.get(`/categories/company/${id}?limit=all`),
          axiosInstance.get(`/methods/company/${id}?limit=all`),
          axiosInstance.get(`/storages/company/${id}?limit=all`)
        ]);
        setCategories(categoriesRes.data.data.result);
        setMethods(methodsRes.data.data.result);
        setStorages(storagesRes.data.data.result);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [id]);

  const onSubmit = async (payload) => {
    // Find the selected category, method, and storage by matching the name with the selected value
    const selectedCategory = categories.find(
      (category: any) => category.name === payload.category
    );
    const selectedMethod = methods.find(
      (method: any) => method.name === payload.method
    );
    const selectedStorage = storages.find(
      (storage: any) => storage.storageName === payload.storage
    );

    if (!selectedCategory || !selectedMethod || !selectedStorage) {
      console.error('Selected data is invalid.');
      return;
    }

    const transactionPayload = {
      transactionDate: format(payload.transactionDate, 'yyyy-MM-dd'),
      invoiceNumber: invoice?.invoiceNumber,
      invoiceDate: invoice?.invoiceDate,
      transactionAmount: invoice?.amount ?? 0,
      transactionCategory: selectedCategory._id, // Use _id of the selected category
      transactionMethod: selectedMethod._id, // Use _id of the selected method
      storage: selectedStorage._id, // Use _id of the selected storage
      transactionType: invoice?.transactionType, // Assuming this is already an _id or string
      details: payload.details,
      companyId: id
    };

    try {
      await axiosInstance.post('/transactions', transactionPayload);

      const updatedInvoice = {
        ...invoice,
        status: 'paid'
      };

      await axiosInstance.patch(
        `/pending-transaction/${invoice?._id}`,
        updatedInvoice
      );

      await axiosInstance.delete(`/pending-transaction/${invoice?._id}`);

      // setInvoices((prevInvoices) =>
      //   prevInvoices.map((inv) =>
      //     inv._id === invoice._id ? updatedInvoice : inv
      //   )
      // );
      setInvoices((prevInvoices) =>
        prevInvoices.filter((inv) => inv._id !== invoice._id)
      );

      toast({
        title: 'Transaction Paid successfully',
        className: 'bg-theme border-none text-white'
      });
      onClose();
    } catch (error) {
      console.error('Error creating transaction or updating invoice:', error);
      toast({
        title: 'Transaction Paid failed',
        className: 'bg-destructive border-none text-white'
      });
    }
  };

  const capitalizeFirst = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="h-[85vh] overflow-y-auto sm:max-w-[650px]">
        <div>
          <DialogTitle>Complete Transaction</DialogTitle>
          <DialogDescription>
            Please provide payment details to mark this invoice as paid
          </DialogDescription>
        </div>

        <div className="-mt-4 grid">
          <div className="grid">
            <div className="bg-theme/50 grid grid-cols-2 gap-2 rounded-lg ">
              <div className="space-y-2">
                <p className="mb-2 text-sm font-semibold">Invoice Details</p>
                <div className="space-y-2">
                  <p className="text-sm text-black">
                    <span className="font-medium">Invoice Number:</span>{' '}
                    {invoice.invoiceNumber}
                  </p>
                  <p className="text-sm text-black">
                    <span className="font-medium">Invoice Date:</span>{' '}
                    {format(invoice.invoiceDate, 'PPP')}
                  </p>
                  <p className="text-sm text-black">
                    <span className="font-medium">Imported From:</span>{' '}
                    {invoice.companyId?.name}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-black">
                    <span className="font-medium">Transaction Type:</span>{' '}
                    {capitalizeFirst(invoice.transactionType)}
                  </p>

                  <p className="text-sm text-black">
                    <span className="font-medium">Amount:</span> £
                    {invoice.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            {invoice.description && (
              <div className="my-1 space-y-1">
                <p className="text-sm text-black">
                  <span className="font-medium">Description:</span>{' '}
                  {invoice.description}
                </p>
              </div>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-1"
              >
                <FormField
                  control={form.control}
                  name="method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction Method</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {methods.map((method: any) => (
                            <SelectItem
                              key={method.id}
                              value={method.name}
                              className="hover:bg-black hover:text-white"
                            >
                              {method.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories
                            .filter((category: any) =>
                              invoice?.transactionType === 'inflow'
                                ? category.type === 'inflow'
                                : category.type === 'outflow'
                            )
                            .map((category: any) => (
                              <SelectItem
                                key={category.id}
                                value={category.name}
                                className="hover:bg-black hover:text-white"
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="storage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Storage</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select storage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {storages.map((storage: any) => (
                            <SelectItem
                              key={storage.id}
                              value={storage.storageName}
                              className="hover:bg-black hover:text-white"
                            >
                              {storage.storageName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transactionDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Transaction Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={
                            field.value
                              ? moment(field.value).format('YYYY-MM-DD')
                              : ''
                          }
                          onChange={(e) =>
                            field.onChange(
                              moment(e.target.value, 'YYYY-MM-DD').toDate()
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Details</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any additional payment notes..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 ">
                  <Button variant="outline" onClick={onClose} type="button">
                    Cancel
                  </Button>
                  <Button type="submit" variant="theme" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Complete Transaction'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
