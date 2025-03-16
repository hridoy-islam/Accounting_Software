import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import * as z from 'zod';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CategorySelector } from '../../company/components/category-selector';
import { Label } from '@/components/ui/label';
import { useParams } from 'react-router-dom';

const formSchema = z.object({
  transactionType: z.enum(['inflow', 'outflow']),
  transactionDate: z.string().min(1, 'Transaction date is required'),
  invoiceNumber: z.string().optional(),
  invoiceDate: z.string().optional(),
  details: z.string().optional(),
  description: z.string().optional(),
  amount: z.string().min(1, 'Amount is required'), // This will be converted to `transactionAmount`
  transactionCategory: z.string().min(1, 'Category is required'), // Added this field
  transactionMethod: z.string().min(1, 'Method is required'), // Added this field
  storage: z.string().min(1, 'Storage is required'), // Added this field
});

export function TransactionDialog({
  open,
  onOpenChange,
  categories,
  methods,
  storages,
  onSubmit,
  editingTransaction
}) {
  const [file, setFile] = useState<File | null>(null);
  const { id } = useParams();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactionType: 'inflow',
      transactionDate: new Date().toISOString().split('T')[0], // Default to today's date
      invoiceNumber: '',
      invoiceDate: '',
      details: '',
      description: '',
      amount: '',
      transactionCategory: '',
      transactionMethod: '',
      storage: '',
      ...editingTransaction, // Spread editingTransaction to populate fields when editing
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      let fileUrl = '';
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const fileUploadResponse = await axiosInstance.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        fileUrl = fileUploadResponse.data.url;
      }
  
      const payload = {
        transactionType: values.transactionType,
        transactionDate: new Date(values.transactionDate).toISOString(), // Convert to ISO string
        invoiceNumber: values.invoiceNumber,
        invoiceDate: values.invoiceDate ? new Date(values.invoiceDate).toISOString() : null, // Convert to ISO string if exists
        details: values.details,
        description: values.description,
        transactionAmount: parseFloat(values.amount), // Convert string to number
        transactionCategory: values.transactionCategory,
        transactionMethod: values.transactionMethod,
        storage: values.storage,
        transactionDoc: fileUrl, // Include the file URL if uploaded
        companyId: id, // Include the company ID from URL params
      };
  
      onSubmit(payload); // Pass the payload to the parent component
      form.reset(); // Reset the form
      setFile(null); // Clear the file state
      onOpenChange(false); // Close the dialog
    } catch (error) {
      console.error('Error submitting transaction:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="transactionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter invoice number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="invoiceDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="transactionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type & Category</FormLabel>
                    <FormControl>
                      <CategorySelector
                        categories={categories}
                        onSelect={(categoryId) =>
                          form.setValue('transactionCategory', categoryId)
                        }
                        onTypeChange={(type) => {
                          form.setValue('transactionType', type);
                          form.setValue('transactionCategory', '');
                        }}
                        defaultType={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Details</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter transaction details"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
            <FormField
  control={form.control}
  name="transactionMethod"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Method</FormLabel>
      <Select onValueChange={field.onChange} value={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {methods.map((method) => (
            <SelectItem key={method._id} value={method._id}>
              {method.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
              <FormField
  control={form.control}
  name="storage"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Storage</FormLabel>
      <Select onValueChange={field.onChange} value={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select storage" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {storages.map((storage) => (
            <SelectItem key={storage._id} value={storage._id}>
              {storage.storageName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button variant="theme" type="submit">
                {editingTransaction ? 'Save Changes' : 'Add Transaction'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
