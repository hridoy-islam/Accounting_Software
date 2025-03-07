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
import { useForm } from 'react-hook-form';
import axiosInstance from '@/lib/axios';
import { toast } from '@/components/ui/use-toast';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import company from '@/assets/imges/home/company.png';
import { Switch } from '@/components/ui/switch';

export interface TCompany {
  id: string;
  companyName: string;
  email: string;
  phone: string;
  companyAddress: string;
  assignUser?: string[];
  logo?: string;
}

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
  image?: string;
  createdBy?: string;
  otp?: string;
  otpExpiry?: Date | null;
  companyId?: string;
}

export function Dashboard() {
  const user = useSelector((state: any) => state.auth.user); // Get user from Redux state
  const [users, setUsers] = useState<any>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<TUser | null>(null);
  const [initialLoading, setInitialLoading] = useState(true); // New state for initial loading
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (editingUser) {
      reset(editingUser);
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
      setInitialLoading(false); // Disable initial loading after the first fetch
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
          title: 'Updated Successfully'
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
    if (data.color) {
      data.color = data.color.toLowerCase();
    }

    if (editingUser) {
      const updateData = { ...data };

      // Check if the password field is provided
      if (!data.password) {
        // If the password is not provided, delete it from the update data
        delete updateData.password;
      }
      await axiosInstance.patch(`/users/${editingUser?._id}`, updateData);
      toast({
        title: 'Record Updated successfully',
        className: 'bg-background border-none text-white'
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

  return (
    <div className="p-4">
      <div className="flex items-center justify-between pb-12">
        <div className="flex flex-1 items-center justify-between space-x-4">
          <h1 className="pb-6 text-2xl font-semibold">Registered Company</h1>

          <Button
            variant="theme"
            onClick={() => {
              setEditingUser(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Company
          </Button>
        </div>
      </div>
      <div className="rounded-md   ">
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
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="flex flex-row justify-end">
                  <img
                    src={user.image || company}
                    alt="User"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                </TableCell>

                <TableCell className="text-right">{user.name}</TableCell>
                <TableCell className="text-right">{user.email}</TableCell>
                <TableCell className="text-right">{user.phone}</TableCell>
                <TableCell className="text-right">{user.address}</TableCell>
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
          if (!open) setEditingUser(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Edit Company' : 'New Company'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 ">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  {...register('name', { required: 'This field is required' })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  {...register('email', { required: 'This field is required' })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  {...register('phone', { required: 'This field is required' })}
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  {...register('address', {
                    required: 'This field is required'
                  })}
                />
              </div>

              <div>
                <Label htmlFor="color">Company Color (Optional)</Label>
                <Input
                  type="color"
                  id="color"
                  {...register('themeColor', {
                    setValueAs: (value) => value.toLowerCase() // Ensure lowercase
                  })}
                  className="w-16"
                />
              </div>
              {!editingUser && (
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    type="password"
                    id="password"
                    {...register('password', {
                      required: !editingUser ? 'This field is required' : false
                    })}
                  />
                </div>
              )}
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
