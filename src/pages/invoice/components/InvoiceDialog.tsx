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

interface Transaction {
  id: string;
  tcid: string;
  transactionDate: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  details?: string;
  description?: string;
  transactionAmount: number;
  transactionDoc?: File | null;
  transactionCategory: string;
  transactionMethod: string;
  storage: string;
  transactionType: 'inflow' | 'outflow';
  companyId: string;
}

interface InvoiceDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onClose: () => void;
  // onConfirm: (paymentDetails) => void;
}

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
      transactionDate: new Date(),
 
    }
  });

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

    // Build the transaction payload
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
      companyId: id,
      transactionDoc:invoice?.invDoc
    
    };

    try {
      await axiosInstance.post('/transactions', transactionPayload);

      const updatedInvoice = {
        ...invoice,
        status: 'paid'
      };

      await axiosInstance.patch(`/invoice/${invoice?._id}`, updatedInvoice);

      // Update the invoices in state if needed
      setInvoices((prevInvoices) =>
        prevInvoices.map((inv) =>
          inv._id === invoice._id ? updatedInvoice : inv
        )
      );

      onClose();
    } catch (error) {
      console.error('Error creating transaction or updating invoice:', error);
    }
  };

  const capitalizeFirst = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-[650px] h-[80vh] overflow-y-auto">
        <div>
          <DialogTitle>Confirm Payment</DialogTitle>
          <DialogDescription>
            Please provide payment details to mark this invoice as paid
          </DialogDescription>
        </div>

        <div className="-mt-4 grid">
          <div className="grid gap-1">
            <div className="bg-theme/50 grid grid-cols-2 gap-2 rounded-lg">
              {/* Invoice Details Section */}
              <div className="space-y-2">
                <p className="mb-2 text-sm font-semibold">Invoice Details</p>
                <div className="space-y-1">
                  <p className="text-sm text-black">
                    <span className="font-medium">Reference Invoice Number:</span>{' '}
                    {invoice.invoiceNumber}
                  </p>
                  <p className="text-sm text-black">
                    <span className="font-medium">Invoice Date:</span>{' '}
                    {format(invoice.invoiceDate, 'PPP')}
                  </p>
                  
                 
                  {invoice.details && (
                  <div className="space-y-1">
                    <p className="text-sm text-black">
                      <span className="font-medium">Details:</span>{' '}
                      {invoice.details}
                    </p>
                  </div>
                )}
                </div>
              </div>

              {/* Description and Transaction Details Section */}
              <div className="mt-6 space-y-2">
                
            
                <div className="space-y-1">
                <p className="text-sm text-black">
                    <span className="font-medium">Customer:</span>{' '}
                    {invoice.customer?.name}
                  </p>

                  <p className="text-sm text-black">
                    <span className="font-medium">Transaction Type:</span>{' '}
                    {capitalizeFirst(invoice.transactionType)}
                  </p>

                  <p className="text-sm text-black">
                    <span className="font-medium">Status:</span>{' '}
                    {capitalizeFirst(invoice.status)}
                  </p>
                  <p className="text-sm text-black">
                    <span className="font-medium">Amount:</span> £
                    {invoice.amount.toFixed(2)}
                  </p>

                  {invoice.description && (
                  <div className="space-y-1">
                    <p className="text-sm text-black">
                      <span className="font-medium">Description:</span>{' '}
                      {invoice.description}
                    </p>
                  </div>
                )}
                </div>
              </div>
            </div>

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

                

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={onClose} type="button">
                    Cancel
                  </Button>
                  <Button type="submit" variant="theme">
                    Confirm Payment
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
