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
import axiosInstance from '@/lib/axios'
import { toast } from '@/components/ui/use-toast';
import { useSelector } from 'react-redux';

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

export function UserTable() {
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
      const response = await axiosInstance.get(`/users?createdBy=${user._id}`);
      setUsers(response.data.data.result);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setInitialLoading(false); // Disable initial loading after the first fetch
    }
  };

  useEffect(() => {
    fetchData()
  }, []);


  const onSubmit = async (data: any) => {
    if (editingUser) {
      const updateData = { ...data };

      // Check if the password field is provided
      if (!data.password) {
        // If the password is not provided, delete it from the update data
        delete updateData.password;
      }
      await axiosInstance.patch(`/users/${editingUser?._id}`, updateData);
      toast({ title: "Record Updated successfully", className: "bg-background border-none text-white", });
      fetchData();
      setEditingUser(null)
    } else {
      const formattedData = { ...data, createdBy: user._id }
      await axiosInstance.post('/auth/signup', formattedData)
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
          <h1 className="pb-6 text-2xl font-semibold">User Management</h1>

          <Button
            variant='theme'
            onClick={() => {
              setEditingUser(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New User
          </Button>
        </div>
      </div>
      <div className="rounded-md   ">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>

                <TableCell className="space-x-4 ">
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
            <DialogTitle>{editingUser ? 'Edit User' : 'New User'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 ">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...register('name', { required: 'This field is required' })} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" {...register('email', { required: 'This field is required' })} />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register('phone', { required: 'This field is required' })} />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                type='password'
                  id="password"
                  {...register('password', {
                    required: !editingUser ? 'This field is required' : false
                  })}
                />
              </div>

            </div>
            <Button type="submit" variant='theme' className="w-full">Save</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
