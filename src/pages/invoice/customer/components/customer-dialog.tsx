import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Select from 'react-select'; // Import react-select
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

// Country Data
const countryOptions = [
  { value: 'Bangladesh', label: 'Bangladesh' },
  { value: 'United States', label: 'United States' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Australia', label: 'Australia' },
  { value: 'India', label: 'India' },
  { value: 'Germany', label: 'Germany' },
  { value: 'France', label: 'France' },
  // Add more as needed
];

// Custom Styles for React Select to match Shadcn UI
const customStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    borderColor: state.isFocused ? 'black' : '#e2e8f0', // Match input border
    borderRadius: '0.375rem', // Match rounded-md
    fontSize: '0.875rem', // Match text-sm
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

// 1. Define Validation Schema
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
  
  // Hidden fields
  companyId: z.string().optional()
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export function CustomerDialog({ open, onOpenChange, onSubmit, initialData }) {
  const { id } = useParams();

  // 2. Setup Form
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
      companyId: id
    }
  });

  // 3. Reset form when Dialog opens or Data changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          name: initialData.name ?? '',
          email: initialData.email ?? '',
          phone: initialData.phone ?? '',
          address: initialData.address ?? '',
          address2: initialData.address2 ?? '',
          city: initialData.city ?? '',
          state: initialData.state ?? '',
          postCode: initialData.postCode ?? '',
          country: initialData.country ?? '',
          bankName: initialData.bankName ?? '',
          accountNo: initialData.accountNo ?? '',
          sortCode: initialData.sortCode ?? '',
          beneficiary: initialData.beneficiary ?? '',
          companyId: id
        });
      } else {
        form.reset({
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
          companyId: id
        });
      }
    }
  }, [open, initialData, form, id]);

  const onSubmitForm = (data: CustomerFormValues) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[96vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Customer' : 'Add New Customer'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-4">
            
            {/* Grid Layout changed to 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* --- Basic Info --- */}
              <div className="col-span-1 md:col-span-3 pb-2 border-b">
                <span className="font-semibold text-gray-700">Basic Information</span>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Customer Name" {...field} />
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
                      <Input placeholder="Email" {...field} />
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
                      <Input placeholder="Phone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* --- Address Block --- */}
              <div className="col-span-1 md:col-span-3 pb-2 border-b mt-2">
                <span className="font-semibold text-gray-700">Address Details</span>
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 1 <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Street Address" {...field} />
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
                      <Input placeholder="Apartment, Unit, etc." {...field} />
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
                      <Input placeholder="City" {...field} />
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
                      <Input placeholder="State" {...field} />
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
                      <Input placeholder="Post Code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* REACT SELECT FOR COUNTRY */}
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
              <div className="col-span-1 md:col-span-3 pb-2 border-b mt-2">
                <span className="font-semibold text-gray-700">Banking Details</span>
              </div>

              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Bank Name" {...field} />
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
                      <Input placeholder="Account Number" {...field} />
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
                      <Input placeholder="Sort Code" {...field} />
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
                      <Input placeholder="Beneficiary" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="mt-6">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="theme">
                {initialData ? 'Save Changes' : 'Add Customer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}