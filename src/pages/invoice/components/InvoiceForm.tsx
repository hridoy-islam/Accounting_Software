import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import moment from 'moment';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/button';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

export function InvoiceForm({
  setIsFormOpen,
  editingInvoice,
  setEditingInvoice
}) {
  const { id } = useParams();
  const [companyData, setCompanyData] = useState<{
    name?: string;
    _id?: string;
  }>({});
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const company = await axiosInstance.get(`/users/${id}`);
        setCompanyData(company.data.data);
        form.setValue('billedFrom', company.data?.data?.name);

        form.setValue('billedFromEmail', company.data?.data?.email);
        form.setValue('billedFromPhone', company.data?.data?.phone);
        form.setValue('billedFromAddress', company.data?.data?.address);
      } catch (error) {
        console.error('Error fetching company data:', error);
      }
    };

    fetchCompanyData();
  }, [id]);

  const form = useForm({
    defaultValues: {
      billedFrom: '',
      billedFromEmail: '',
      billedFromPhone: '',
      billedFromAddress: '',
      billedTo: editingInvoice?.billedTo || '',
      billedToEmail: editingInvoice?.billedToEmail || '',
      billedToPhone: editingInvoice?.billedToPhone || '',
      billedToAddress: editingInvoice?.billedToAddress || '',
      invoiceDate: editingInvoice?.invoiceDate || '',
      invoiceNumber: editingInvoice?.invoiceNumber || '',
      description: editingInvoice?.description || '',
      status: editingInvoice?.status || 'due',
      transactionType: editingInvoice?.transactionType || 'inflow',
      amount: editingInvoice?.amount || 0
    }
  });

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        companyId: id
      };

      if (editingInvoice) {
        await axiosInstance.patch(`/invoice/${editingInvoice._id}`, payload);
        toast({
          title: 'Invoice Updated Successfully'
        });
      } else {
        await axiosInstance.post('/invoice', payload);
        toast({
          title: 'Invoice Created Successfully'
        });
      }

      setIsFormOpen(false); 
    } catch (error) {
      console.error('Error submitting invoice:', error);
      toast({
        title: 'Failed to process invoice'
      });
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center px-6 md:px-12">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full max-w-4xl space-y-6 pb-4"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Left Side: Billed From */}
            <div className="flex flex-col gap-6">
              <FormField
                control={form.control}
                name="billedFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billed From</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Company name"
                        {...field}
                        value={companyData?.name}
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Billed From Email */}
              <FormField
                control={form.control}
                name="billedFromEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Company Email"
                        {...field}
                        value={companyData?.email}
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Billed From Phone */}
              <FormField
                control={form.control}
                name="billedFromPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Phone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Company Phone"
                        {...field}
                        value={companyData?.phone}
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Billed From Address */}
              <FormField
                control={form.control}
                name="billedFromAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Company Address"
                        {...field}
                        value={companyData?.address}
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Invoice Date */}
              <FormField
                control={form.control}
                name="invoiceDate"
                render={({ field }) => (
                  <FormItem className="w-full ">
                    <FormLabel>Invoice Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={date ? moment(date).format('YYYY-MM-DD') : ''}
                        onChange={(e) => {
                          const selectedDate = moment(
                            e.target.value,
                            'YYYY-MM-DD'
                          ).toDate();
                          setDate(selectedDate);
                          field.onChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Invoice Number */}
              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem className="w-full ">
                    <FormLabel>Invoice Number</FormLabel>
                    <FormControl>
                      <Input placeholder="INV-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Right Side: Billed To */}
            <div className="flex flex-col gap-6">
              <FormField
                control={form.control}
                name="billedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billed To</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Client name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Billed To Email */}
              <FormField
                control={form.control}
                name="billedToEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter Client email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Billed To Phone */}
              <FormField
                control={form.control}
                name="billedToPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Enter Client phone number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Billed To Address */}
              <FormField
                control={form.control}
                name="billedToAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Client address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Transaction Type */}
              <FormField
                control={form.control}
                name="transactionType"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Transaction Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select transaction type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="inflow">Inflow</SelectItem>
                        <SelectItem value="outflow">Outflow</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="w-full ">
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter Description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex w-full justify-end space-x-4">
            {!editingInvoice ? (
              <Button variant="theme" type="submit">
                Create Invoice
              </Button>
            ) : (
              <Button variant="theme" type="submit">
                Update Invoice
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => {
                setIsFormOpen(false); // Close the form
                setEditingInvoice(false); // Reset editingInvoice state
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
