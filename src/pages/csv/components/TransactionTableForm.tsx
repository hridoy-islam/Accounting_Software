import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { CategorySelector } from '@/pages/csv/components/category-selector';
import { toast } from '@/components/ui/use-toast';
import axiosInstance from '@/lib/axios';
import { usePermission } from '@/hooks/usePermission';
import { useEffect } from 'react';


const transactionSchema = z.object({
  transactionType: z.enum(['inflow', 'outflow'], {
    required_error: 'Transaction type is required.'
  }),
  transactionDate: z
    .string()
    .min(1, 'Transaction date is required.')
    .transform((str) => new Date(str)),
  invoiceNumber: z.string().optional(),
  invoiceDate: z
    .string()
    .optional()
    .transform((str) => (str ? new Date(str) : undefined)),
  details: z.string().optional(),
  description: z.string().optional(),
  transactionAmount: z.preprocess(
    (val) => Number(val),
    z.number().min(1, 'Transaction amount is required.')
  ),
  transactionDoc: z.string().optional(),
  transactionCategory: z.string().min(1, 'Category is required.'),
  transactionMethod: z.string().min(1, 'Method is required.'),
  storage: z.string().min(1, 'Storage is required.')
});

const TransactionTableForm = ({
  categories,
  methods,
  storages,
  transactions,
  onSubmit,
  setTransactions,
  csvDocId,
  setCsvDocId,
  setHide
}) => {
  const {hasPermission} = usePermission();
  
  const form = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      transactions: transactions.map((transaction) => ({
        ...transaction,
        transactionCategory: '',
        transactionMethod: '',
        storage: ''
      }))
    }
  });
console.log(categories)
  useEffect(() => {
    form.reset({
      transactions: transactions.map((transaction) => ({
        ...transaction,
        transactionCategory: '',
        transactionMethod: '',
        storage: ''
      }))
    });
  }, [transactions, form]);

  const handleRowSubmit = async (index) => {
    const transaction = form.getValues(`transactions.${index}`);

    const validationResult = transactionSchema.safeParse(transaction);

    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error);
      validationResult.error.errors.forEach((err) => {
        form.setError(`transactions.${index}.${err.path[0]}`, {
          type: 'manual',
          message: err.message
        });
      });
      return;
    }

    try {
      await onSubmit(validationResult.data);

      if (transaction._id && csvDocId) {
        await axiosInstance.patch(`/csv/${csvDocId}`, {
          transactionId: transaction._id
        });

        if (transactions.length === 1) {
          await axiosInstance.delete(`/csv/${csvDocId}`);
          setCsvDocId(null);
          setHide(false);
        }
      } else {
        console.warn('Missing transaction ID or CSV document ID');
      }

      const updatedTransactions = transactions.filter((_, i) => i !== index);
      setTransactions(updatedTransactions);

      // Reset form
      form.reset({
        transactions: updatedTransactions.map((t) => ({
          ...t,
          transactionCategory: '',
          transactionMethod: '',
          storage: ''
        }))
      });
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: 'Failed to submit transaction',

        variant: 'destructive'
      });
    }
  };

  return (
    <Form  key={transactions.length} {...form}>
      <form className="space-y-4">
        <div className="flex flex-row justify-end font-medium text-gray-700">
          {form.watch('transactions')?.length || 0} Rows Found
        </div>
        <div className="w-full overflow-hidden">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="min-w-[50px]">Date</TableHead>
                <TableHead className="min-w-[50px]">Invoice</TableHead>
                <TableHead className="min-w-[50px]">Inv. Date</TableHead>
                <TableHead className="min-w-[50px]">Details</TableHead>
                <TableHead className="min-w-[50px]">Description</TableHead>
                <TableHead className="min-w-[50px]">Category</TableHead>
                <TableHead className="min-w-[50px]">Method</TableHead>
                <TableHead className="min-w-[50px]">Storage</TableHead>
                <TableHead className="min-w-[50px]">Amount</TableHead>
                <TableHead className="min-w-[50px]">Type</TableHead>
                <TableHead className="min-w-[50px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {form.watch('transactions')?.map((transaction, index) => (
                <TableRow key={transaction.id}>
                  <TableCell className="max-w-[130px]">
                    <FormField
                      control={form.control}
                      name={`transactions.${index}.transactionDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <input
                              type="date"
                              {...field}
                              className="w-full rounded-md border border-gray-300 bg-transparent py-1.5"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell className="max-w-[100px]">
                    <FormField
                      control={form.control}
                      name={`transactions.${index}.invoiceNumber`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Invoice #"
                              {...field}
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell className="max-w-[130px]">
                    <FormField
                      control={form.control}
                      name={`transactions.${index}.invoiceDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <input
                              type="date"
                              {...field}
                              className="w-full rounded-md border border-gray-300 bg-transparent py-1.5"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell className="min-w-[50px]">
                    <FormField
                      control={form.control}
                      name={`transactions.${index}.details`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Enter details"
                              {...field}
                              className="min-h-[60px] w-full"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell className="min-w-[50px]">
                    <FormField
                      control={form.control}
                      name={`transactions.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Description"
                              {...field}
                              className="min-h-[60px] w-full"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell className="min-w-[50px]">
                    <FormField
                      control={form.control}
                      name={`transactions.${index}.transactionCategory`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <CategorySelector
                              categories={categories}
                              onSelect={(categoryId) =>
                                form.setValue(
                                  `transactions.${index}.transactionCategory`,
                                  categoryId
                                )
                              }
                              onTypeChange={(type) => {
                                form.setValue(
                                  `transactions.${index}.transactionType`,
                                  type
                                );
                                form.setValue(
                                  `transactions.${index}.transactionCategory`,
                                  ''
                                ); // Reset category
                              }}
                              defaultType={transaction.transactionType}
                              value={field.value} // Pass current value to component
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell className="min-w-[50px]">
                    <FormField
                      control={form.control}
                      name={`transactions.${index}.transactionMethod`}
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
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
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell className="min-w-[50px]">
                    <FormField
                      control={form.control}
                      name={`transactions.${index}.storage`}
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select storage" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {storages.map((storage) => (
                                <SelectItem
                                  key={storage._id}
                                  value={storage._id}
                                >
                                  {storage.storageName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell className="min-w-[50px]">
                    <FormField
                      control={form.control}
                      name={`transactions.${index}.transactionAmount`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              className="w-full font-medium"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell className="min-w-[50px]">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        transaction.transactionType === 'inflow'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {transaction.transactionType}
                    </span>
                  </TableCell>
                  {hasPermission('TransactionList', 'create') && (
                  <TableCell className="min-w-[50px]">
                    <Button
                      size="icon"
                      variant="theme"
                      className="h-8 w-8"
                      type="button"
                      onClick={() => handleRowSubmit(index)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </TableCell>)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </form>
    </Form>
  );
};

export default TransactionTableForm;
