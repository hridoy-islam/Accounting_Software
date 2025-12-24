import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Select from 'react-select';

import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { usePermission } from '@/hooks/usePermission';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

// --- Configuration & Helpers ---

const countryOptions = [
  { value: 'Bangladesh', label: 'Bangladesh' },
  { value: 'United States', label: 'United States' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Australia', label: 'Australia' },
  { value: 'India', label: 'India' },
  { value: 'Germany', label: 'Germany' },
  { value: 'France', label: 'France' },
];

const customStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    borderColor: state.isFocused ? 'black' : '#e2e8f0',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    boxShadow: 'none',
    minHeight: '2.5rem',
    '&:hover': {
      borderColor: state.isFocused ? 'black' : '#cbd5e1'
    }
  }),
  menu: (provided: any) => ({
    ...provided,
    zIndex: 9999,
    fontSize: '0.875rem'
  })
};

// --- Validation Schema ---

const customerSchema = z.object({
  name: z.string().min(1, 'Customer Name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  
  // Address Block
  address: z.string().min(1, 'Address Line 1 is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State/Province is required'),
  postCode: z.string().min(1, 'Post Code is required'),
  country: z.string().min(1, 'Country is required'),

  // Banking Block
  bankName: z.string().min(1, 'Bank Name is required'),
  accountNo: z.string().min(1, 'Account Number is required'),
  sortCode: z.string().min(1, 'Sort Code is required'),
  beneficiary: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

// --- Component ---

const CustomerDetailsPage = () => {
  const { id, cid } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = usePermission();

  // Setup React Hook Form
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      address2: '',
      city: '',
      state: '',
      postCode: '',
      country: '',
      bankName: '',
      accountNo: '',
      sortCode: '',
      beneficiary: '',
    },
  });

  // Watch for changes to show "Update" button
  const { isDirty } = form.formState;

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(`/customer/${cid}`);
      const data = response.data.data;
      
      // Reset form with fetched data
      form.reset({
        name: data.name ?? '',
        email: data.email ?? '',
        phone: data.phone ?? '',
        address: data.address ?? '',
        address2: data.address2 ?? '',
        city: data.city ?? '',
        state: data.state ?? '',
        postCode: data.postCode ?? '',
        country: data.country ?? '',
        bankName: data.bankName ?? '',
        accountNo: data.accountNo ?? '',
        sortCode: data.sortCode ?? '',
        beneficiary: data.beneficiary ?? '',
      });
    } catch (error) {
      console.error('Error fetching customer details:', error);
      toast({
        title: 'Error fetching details',
        className: 'bg-destructive border-none text-white',
      });
    }
  };

  useEffect(() => {
    if (cid) {
      fetchData();
    }
  }, [cid]);

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      const response = await axiosInstance.patch(`/customer/${cid}`, data);
      if (response.data.success) {
        fetchData(); // Refresh data to reset isDirty state
        toast({
          title: 'Record Updated successfully',
          className: 'bg-theme border-none text-white',
        });
      } else {
        toast({
          title: 'Error updating Customer',
          className: 'bg-destructive border-none text-white',
        });
      }
    } catch (error) {
      toast({
        title: 'Error updating Customer',
        className: 'bg-destructive border-none text-white',
      });
    }
  };

  return (
    // Add bottom padding so content isn't hidden behind the fixed footer
    <div className="pb-24">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        {/* Header / Back Button */}
        <div className="flex flex-row items-start justify-end mb-6">
          <Button
            className="bg-theme text-white"
            size="sm"
            onClick={() => navigate(`/admin/company/${id}/invoice/customer`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back To Customer List
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Grid Layout - 3 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* --- Basic Info --- */}
              <div className="col-span-1 md:col-span-3 pb-2 border-b">
                <span className="font-semibold text-lg text-gray-700">Basic Information</span>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* --- Address Block --- */}
              <div className="col-span-1 md:col-span-3 pb-2 border-b ">
                <span className="font-semibold text-lg text-gray-700">Address Details</span>
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 1 <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 2 <span className="text-gray-400 font-normal">(Optional)</span></FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post Code <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* React Select for Country */}
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Select
                        {...field}
                        options={countryOptions}
                        value={countryOptions.find((c) => c.value === field.value)}
                        onChange={(val) => field.onChange(val?.value)}
                        styles={customStyles}
                        placeholder="Select Country"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* --- Banking Block --- */}
              <div className="col-span-1 md:col-span-3 pb-2 border-b ">
                <span className="font-semibold text-lg text-gray-700">Banking Details</span>
              </div>

              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account No <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sortCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Code <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="beneficiary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beneficiary</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

           
            {isDirty && hasPermission('Customer', 'edit') && (
              <div className="fixed bottom-0 left-0 right-0 z-50  p-4 ">
                <div className="container mx-auto flex justify-end ">
                  <Button type="submit" variant="theme" size="lg">
                    Update Customer
                  </Button>
                </div>
              </div>
            )}
            
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CustomerDetailsPage;