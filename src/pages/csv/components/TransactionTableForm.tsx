import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

// Define the Zod schema
const transactionSchema = z.object({
  transactionType: z.enum(['inflow', 'outflow'], {
    required_error: 'Transaction type is required.',
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
  transactionCategory: z.string().min(1, 'Transaction category is required.'),
  transactionMethod: z.string().min(1, 'Transaction method is required.'),
  storage: z.string().min(1, 'Storage is required.'),
});

const TransactionTableForm = ({
  categories,
  methods,
  storages,
  transactions,
  onSubmit,
  setTransactions,
}) => {
  // Initialize the form with Zod validation
  const form = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      transactions: transactions.map(transaction => ({
        ...transaction,
        transactionCategory: '', // Reset category
        transactionMethod: '', // Reset method
        storage: '', // Reset storage
      })),
    },
  });

  const handleRowSubmit = async (index) => {
    const transaction = form.getValues(`transactions.${index}`);

    // Validate the transaction using safeParse
    const validationResult = transactionSchema.safeParse(transaction);

    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error.errors);
      return;
    }

    try {
      await onSubmit(validationResult.data);

      // Remove the submitted transaction from state
      const updatedTransactions = transactions.filter((_, i) => i !== index);
      setTransactions(updatedTransactions);

      // Reset the form with updated transactions
      form.reset({
        transactions: updatedTransactions.map((t) => ({
          ...t,
          transactionCategory: '', // Explicitly reset category
          transactionMethod: '', // Explicitly reset method
          storage: '', 
        })),
      });
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-4">
        {/* Table container */}
        <div className="w-full overflow-hidden">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="min-w-[100px]">Date</TableHead>
                <TableHead className="min-w-[100px]">Invoice</TableHead>
                <TableHead className="min-w-[100px]">Inv. Date</TableHead>
                <TableHead className="min-w-[100px]">Details</TableHead>
                <TableHead className="min-w-[100px]">Description</TableHead>
                <TableHead className="min-w-[100px]">Category</TableHead>
                <TableHead className="min-w-[100px]">Method</TableHead>
                <TableHead className="min-w-[100px]">Storage</TableHead>
                <TableHead className="min-w-[50px]">Amount</TableHead>
                <TableHead className="min-w-[80px]">Type</TableHead>
                <TableHead className="min-w-[80px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {form.watch('transactions')?.map((transaction, index) => (
                <TableRow key={transaction.id}>
                  <TableCell className="min-w-[100px]">
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
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell className="min-w-[100px]">
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
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell className="min-w-[100px]">
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
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell className="min-w-[100px]">
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
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell className="min-w-[100px]">
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
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell className="min-w-[100px]">
                    <FormField
                      control={form.control}
                      name={`transactions.${index}.transactionCategory`}
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories
                                .filter((category) =>
                                  transaction.transactionType === 'inflow'
                                    ? category.type === 'inflow'
                                    : category.type === 'outflow'
                                )
                                .map((category) => (
                                  <SelectItem
                                    key={category._id}
                                    value={category._id}
                                  >
                                    {category.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell className="min-w-[100px]">
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
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell className="min-w-[100px]">
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
                          <FormMessage className="text-red-500 text-xs" />
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
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell className="min-w-[80px]">
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
                  <TableCell className="min-w-[80px]">
                    <Button
                      size="icon"
                      variant="theme"
                      className="h-8 w-8"
                      type="button"
                      onClick={() => handleRowSubmit(index)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </TableCell>
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