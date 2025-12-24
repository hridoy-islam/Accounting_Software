import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';

import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import axiosInstance from '../../lib/axios';
import Select from 'react-select'; 

import { useToast } from '@/components/ui/use-toast';
import { Camera } from 'lucide-react';
import { ImageUploader } from './components/userImage-uploader';
import { useParams } from 'react-router-dom';
import { usePermission } from '@/hooks/usePermission';

const profileFormSchema = z.object({
  name: z.string().nonempty('Name is required'),
  email: z.string().email({ message: 'Enter a valid email address' }),
  phone: z.string().optional(),
  
  // Address Block
  address: z.string().nonempty('Address Line 1 is required'),
  address2: z.string().optional(),
  city: z.string().nonempty('City is required'),
  state: z.string().nonempty('State/Province is required'),
  postCode: z.string().nonempty('Post Code is required'),
  country: z.string().nonempty('Country is required'),

  // Banking Block
  sortCode: z.string().nonempty('Sort Code is required'),
  accountNo: z.string().nonempty('Account Number is required'),
  beneficiary: z.string().nonempty('Beneficiary is required')
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

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

export default function CompanyDetailsPage() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const { user } = useSelector((state: any) => state.auth);
  const [profileData, setProfileData] = useState<ProfileFormValues | null>(null);
  const { toast } = useToast();
  const { id } = useParams();
  const { hasPermission } = usePermission();

  const defaultValues: Partial<ProfileFormValues> = {
    name: '',
    email: '',
    phone: '',
    address: '',
    address2: '',
    city: '',
    state: '',
    postCode: '',
    country: '',
    sortCode: '',
    accountNo: '',
    beneficiary: ''
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange'
  });

  const fetchProfileData = async () => {
    try {
      const response = await axiosInstance.get(`/users/${id}`);
      const data = response.data.data;
      
      setProfileData(data);
      form.reset({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        address2: data.address2 || '',
        city: data.city || '',
        state: data.state || '',
        postCode: data.postCode || '',
        country: data.country || '',
        sortCode: data.sortCode || '',
        accountNo: data.accountNo || '',
        beneficiary: data.beneficiary || ''
      });
    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast({
        title: 'Error',
        description: 'Unable to fetch profile data',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await axiosInstance.patch(`/users/${id}`, data);
      toast({
        title: 'Company Details Updated',
        className: 'bg-theme border-none text-white'
      });
    } catch (error) {
      toast({
        title: 'Update Failed',
        className: 'bg-destructive border-none text-white'
      });
    }
  };

  const handleUploadComplete = (data) => {
    setUploadOpen(false);
    fetchProfileData();
  };

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
      zIndex: 9999
    })
  };

  return (
    <div className="flex flex-col space-y-2 ">
      <div className="rounded-lg bg-white p-6 shadow-sm">
        
        
        <div className="flex flex-row items-center justify-center mb-6">
          <div className='flex flex-col items-center justify-center'>

          <div className="relative h-48 w-48 overflow-hidden rounded-full border-4 border-gray-100 shadow-sm">
            <img
              src={
                profileData?.imageUrl ||
                'https://kzmjkvje8tr2ra724fhh.lite.vusercontent.net/placeholder.svg'
              }
              alt={`${user?.name}`}
              className="h-full w-full object-cover"
              />
            {hasPermission('CompanyDetails', 'edit') && (
              <Button
              size="icon"
              variant="theme"
              onClick={() => setUploadOpen(true)}
              className="absolute bottom-2 right-12 z-10 rounded-full"
              >
                <Camera className="h-4 w-4" />
              </Button>
            )}
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-800">{profileData?.name || 'Company Name'}</h2>
          <p className="text-sm text-gray-500">{profileData?.email}</p>
            </div>
        </div>

        {/* BOTTOM SECTION: Form */}
        <div className="w-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* --- Section 1: Basic Info --- */}
                <div className="col-span-1 md:col-span-3">
                    <h3 className="font-semibold text-gray-700 mb-4 border-l-4 border-theme pl-2">Basic Information</h3>
                </div>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Name..." {...field} />
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
                        <Input
                          placeholder="example@example.com"
                          disabled
                          {...field}
                        />
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

                {/* --- Section 2: Address Info --- */}
                <div className="col-span-1 md:col-span-3 mt-4">
                    <h3 className="font-semibold text-gray-700 mb-4 border-l-4 border-theme pl-2">Address Details</h3>
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <Input placeholder="Street address" {...field} />
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
                      <FormLabel>Address Line 2 (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Apartment, suite, etc." {...field} />
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
                      <FormLabel>City</FormLabel>
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
                      <FormLabel>State/Province</FormLabel>
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
                      <FormLabel>Post Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Post Code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                         <Select
                            {...field}
                            options={countryOptions}
                            value={countryOptions.find(c => c.value === field.value)}
                            onChange={(val) => field.onChange(val?.value)}
                            styles={customStyles}
                            placeholder="Select Country"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* --- Section 3: Banking Info --- */}
                <div className="col-span-1 md:col-span-3 mt-4">
                    <h3 className="font-semibold text-gray-700 mb-4 border-l-4 border-theme pl-2">Banking Details</h3>
                </div>

                <FormField
                  control={form.control}
                  name="sortCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Sort Code" {...field} />
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
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Account Number" {...field} />
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
                        <Input placeholder="Beneficiary Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end pt-4 ">
                {hasPermission('CompanyDetails', 'edit') && (
                  <Button variant="theme" type="submit" className="min-w-[150px]">
                    Update Details
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>

      <ImageUploader
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploadComplete={handleUploadComplete}
        entityId={id}
      />
    </div>
  );
}