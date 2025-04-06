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

import { useToast } from '@/components/ui/use-toast';
import { Camera } from 'lucide-react';
import { ImageUploader } from './components/userImage-uploader';
import { useParams } from 'react-router-dom';

const profileFormSchema = z.object({
  name: z.string().nonempty('Name is required'),
  email: z.string().email({ message: 'Enter a valid email address' }),
  address: z.string().nonempty('Address Line 1 is required'),
  phone: z.string().optional(),
 
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;



export default function CompanyDetailsPage() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const { user } = useSelector((state: any) => state.auth);
  const [profileData, setProfileData] = useState<ProfileFormValues | null>(null);
  const { toast } = useToast();
const {id} = useParams();

  const defaultValues: Partial<ProfileFormValues> = {
    name: profileData?.name || '',
    email: profileData?.email || '',
    address: profileData?.address || '',
    phone: profileData?.phone || '',
    
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
      form.reset(data);
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
        title: "Update Failed",
        className: "bg-destructive border-none text-white",
      });
    }
  };

  const handleUploadComplete = (data) => {
    setUploadOpen(false);
    fetchProfileData();
  };

  return (
    <div className="space-y-2 p-2 md:p-2">
      <div className="relative h-48 w-48 overflow-hidden rounded-full">
        <img
          src={
            profileData?.imgUrl ||
            'https://kzmjkvje8tr2ra724fhh.lite.vusercontent.net/placeholder.svg'
          }
          alt={`${user?.name}`}
          className="h-full w-full object-contain"
        />
        <Button
          size="icon"
          variant='theme'
          onClick={() => setUploadOpen(true)}
        >
          <Camera className="h-4 w-4" />
        </Button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="grid grid-cols-3 gap-2 pb-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Your Name..." {...field} />
                    </FormControl>
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
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Your Address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
        
            </div>
            <div className='flex justify-end'>

            <Button
              variant='theme'
              type="submit"
              >
              Update Details
            </Button>
              </div>
          </div>
        </form>
      </Form>

      <ImageUploader
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploadComplete={handleUploadComplete}
        entityId={user?._id}
      />
    </div>
  );
}