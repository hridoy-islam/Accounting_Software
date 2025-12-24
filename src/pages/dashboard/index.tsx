import { useEffect, useState } from 'react';
import { Pen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// 1. Import Controller here
import { useForm, Controller } from 'react-hook-form';
// 2. Import React Select
import Select from 'react-select'; 
import axiosInstance from '@/lib/axios';
import { toast } from '@/components/ui/use-toast';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import company from '@/assets/imges/home/company.png';
import { Switch } from '@/components/ui/switch';
import { countries } from '@/types';

// 3. Define Country Options (You can move this to a separate utils file)
const countryOptions = countries.map((country) => ({
    value: country,
    label: country
  }));

export interface TCompany {
  id: string;
  companyName: string;
  email: string;
  phone: string;
  companyAddress: string;
  assignUser?: string[];
  logo?: string;
}

// ... TUser interface remains the same ...
interface TUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  status: string;
  isDeleted: boolean;
  authroized: boolean;
  address?: string;
  address2?: string;
  city?: string;
  state?: string;
  postCode?: string;
  country?: string;
  image?: string;
  createdBy?: string;
  otp?: string;
  otpExpiry?: Date | null;
  companyId?: string;
  themeColor?: string;
}

export function Dashboard() {
  const user = useSelector((state: any) => state.auth.user);
  const [users, setUsers] = useState<any>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<TUser | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // 4. Destructure 'control' from useForm
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm();

  useEffect(() => {
    if (editingUser) {
      reset(editingUser);
    } else {
      reset({});
    }
  }, [editingUser, reset]);

  const fetchData = async () => {
    try {
      if (initialLoading) setInitialLoading(true);
      const response = await axiosInstance.get(
        `/users?createdBy=${user._id}&role=company`
      );
      setUsers(response.data.data.result);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleIsDeleted = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await axiosInstance.patch(`/users/${userId}`, {
        isDeleted: !currentStatus
      });
      if (res.data.success) {
        fetchData();
        toast({
          title: 'Updated Successfully',
          className:'bg-theme text-white border-none'
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error updating Company',
        variant: 'destructive'
      });
    }
  };

  const onSubmit = async (data: any) => {
    if (data.themeColor) {
      data.themeColor = data.themeColor.toLowerCase();
    }

    if (editingUser) {
      const updateData = { ...data };
      
      if (!data.password) {
        delete updateData.password;
      }

      await axiosInstance.patch(`/users/${editingUser?._id}`, updateData);
      toast({
        title: 'Record Updated successfully',
        className: 'bg-theme border-none text-white'
      });
      fetchData();
      setEditingUser(null);
    } else {
      const formattedData = { ...data, createdBy: user._id, role: 'company' };
      await axiosInstance.post('/auth/signup', formattedData);
      fetchData();
    }

    reset();
    setDialogOpen(false);
    setEditingUser(null);
  };

  // Custom styles to make React Select look like Shadcn Input
  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      borderRadius: '0.375rem', // Tailwind rounded-md
      fontSize: '0.875rem',     // Tailwind text-sm
      boxShadow: 'none',
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
    <div className="p-4">
      {/* ... Header and Table code remains exactly the same ... */}
      <div className="flex items-center justify-between pb-12">
        <div className="flex flex-1 items-center justify-between space-x-4">
          <h1 className="pb-6 text-2xl font-semibold">Registered Company</h1>
          <Button
            variant="theme"
            onClick={() => {
              setEditingUser(null);
              reset({});
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Company
          </Button>
        </div>
      </div>

      <div className="rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">Image</TableHead>
              <TableHead className="text-right">Name</TableHead>
              <TableHead className="text-right">Email</TableHead>
              <TableHead className="text-right">Phone</TableHead>
              <TableHead className="text-right">Address</TableHead>
              <TableHead className="text-right">View</TableHead>
              <TableHead className="text-right">Actions</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user: any) => (
              <TableRow key={user.id}>
                {/* ... Table Cell Content ... */}
                <TableCell className="flex flex-row justify-end">
                  <img
                    src={user.imageUrl || company}
                    alt="User"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                </TableCell>
                <TableCell className="text-right">{user.name}</TableCell>
                <TableCell className="text-right">{user.email}</TableCell>
                <TableCell className="text-right">{user.phone}</TableCell>
                <TableCell className="text-right">
                    {user.address} {user.city ? `, ${user.city}` : ''}
                </TableCell>
                <TableCell className="text-right">
                  <Link to={`company/${user._id}`}>
                    <Button variant="theme" className="w-full">
                      View
                    </Button>
                  </Link>
                </TableCell>
                <TableCell className="space-x-4 text-right">
                  <Button
                    variant="theme"
                    size="icon"
                    onClick={() => {
                      setEditingUser(user);
                      setDialogOpen(true);
                    }}
                  >
                    <Pen className="h-4 w-4" />
                  </Button>
                </TableCell>
                <TableCell className="space-x-4 text-right">
                  <Switch
                    checked={user?.isDeleted}
                    onCheckedChange={() =>
                      toggleIsDeleted(user?._id, user?.isDeleted)
                    }
                  />
                  <span
                    className={`ml-1 font-semibold ${user.isDeleted ? 'text-red-500' : 'text-green-500'}`}
                  >
                    {user.isDeleted ? 'Inactive' : 'Active'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingUser(null);
            reset({});
          }
        }}
      >
        <DialogContent className="sm:max-w-[60vw] sm:max-h-[96vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Edit Company' : 'New Company'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Name */}
              <div className="md:col-span-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  {...register('name', { required: 'Full Name is required' })}
                />
                {errors.name && (
                  <span className="text-sm text-red-500">{errors.name.message as string}</span>
                )}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  disabled={!!editingUser}
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                    }
                  })}
                />
                 {errors.email && (
                  <span className="text-sm text-red-500">{errors.email.message as string}</span>
                )}
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  {...register('phone', { required: 'Phone is required' })}
                />
                 {errors.phone && (
                  <span className="text-sm text-red-500">{errors.phone.message as string}</span>
                )}
              </div>

              {/* Address 1 */}
              <div>
                <Label htmlFor="address">Address Line 1</Label>
                <Input
                  id="address"
                  {...register('address', { required: 'Address is required' })}
                />
                {errors.address && (
                  <span className="text-sm text-red-500">{errors.address.message as string}</span>
                )}
              </div>

              {/* Address 2 */}
              <div>
                <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                <Input
                  id="address2"
                  {...register('address2')} 
                />
              </div>

              {/* City */}
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  {...register('city', { required: 'City is required' })}
                />
                {errors.city && (
                  <span className="text-sm text-red-500">{errors.city.message as string}</span>
                )}
              </div>

              {/* State */}
              <div>
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  {...register('state', { required: 'State is required' })}
                />
                {errors.state && (
                  <span className="text-sm text-red-500">{errors.state.message as string}</span>
                )}
              </div>

              {/* Post Code */}
              <div>
                <Label htmlFor="postCode">Post Code</Label>
                <Input
                  id="postCode"
                  {...register('postCode', { required: 'Post Code is required' })}
                />
                {errors.postCode && (
                  <span className="text-sm text-red-500">{errors.postCode.message as string}</span>
                )}
              </div>

              {/* 5. Country - Using React Select with Controller */}
              <div>
                <Label htmlFor="country">Country</Label>
                <Controller
                  name="country"
                  control={control}
                  rules={{ required: 'Country is required' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={countryOptions}
                      inputId="country"
                      // Map the string value (from DB) to the object value (required by React Select)
                      value={countryOptions.find(c => c.value === field.value)}
                      // On change, pull the value out of the object and send just the string to the form
                      onChange={(val) => field.onChange(val?.value)}
                      styles={customStyles}
                      placeholder="Select Country"
                    />
                  )}
                />
                {errors.country && (
                  <span className="text-sm text-red-500">{errors.country.message as string}</span>
                )}
              </div>

              {/* Company Color */}
              <div className="md:col-span-2">
                <Label htmlFor="color">Company Color (Optional)</Label>
                <div className="flex items-center gap-2">
                    <Input
                    type="color"
                    id="color"
                    {...register('themeColor', {
                        setValueAs: (value) => value.toLowerCase()
                    })}
                    className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <span className="text-xs text-muted-foreground">Pick a theme color</span>
                </div>
              </div>

              {/* Password */}
              <div className="">
                <Label htmlFor="password">
                    Password {editingUser ? <span className="text-xs text-muted-foreground font-normal">(Leave blank to keep current)</span> : ''}
                </Label>
                <Input
                  type="password"
                  id="password"
                  placeholder=''
                  {...register('password', {
                    required: !editingUser ? 'Password is required' : false
                  })}
                />
                {errors.password && (
                  <span className="text-sm text-red-500">{errors.password.message as string}</span>
                )}
              </div>

            </div>
            
            <Button type="submit" variant="theme" className="w-full">
              Save
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}