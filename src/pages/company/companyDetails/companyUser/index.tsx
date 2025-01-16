import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import CompanyNav from '../../components/CompanyNav';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useParams } from 'react-router-dom';  // Assuming you're using React Router for route params

interface TUser {
  id: string;
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

const mockUsers: TUser[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    password: 'password123',
    role: 'User',
    status: 'Active',
    isDeleted: false,
    authroized: true,
    address: '123 Main Street',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '987-654-3210',
    password: 'securepass',
    role: 'Admin',
    status: 'Inactive',
    isDeleted: false,
    authroized: false,
    address: '456 Elm Street',
  },
];

const CompanyUser: React.FC = () => {
  const [users, setUsers] = useState<TUser[]>(mockUsers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Fetch companyId from route params (assuming you're using React Router)
  const { companyId } = useParams();

  // Use react-hook-form
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TUser>({
    defaultValues: {
      id: '',
      name: '',
      email: '',
      phone: '',
      password: '',
      role: '',
      status: '',
      isDeleted: false,
      authroized: false,
      address: '',
      companyId: companyId || '',
    },
  });

  const onSubmit: SubmitHandler<TUser> = (data) => {
    if (!data.id || !data.name || !data.email || !data.phone || !data.password || !data.role || !data.status) {
      alert('All required fields must be filled.');
      return;
    }

    // Adding new user
    const newUser: TUser = {
      ...data,
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: data.role,
      status: data.status,
      isDeleted: data.isDeleted ?? false,
      authroized: data.authroized ?? false,
      companyId: data.companyId,  // Automatically set companyId from params
    };

    setUsers([...users, newUser]);

    // Reset form after submission
    reset();
    setIsDialogOpen(false);
  };

  return (
    <div className="container mx-auto p-6">
      <CompanyNav />
      <h1 className="mb-8 text-2xl font-semibold">Users</h1>

      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsDialogOpen(true)}>Add User</Button>
      </div>

      <div className="flex flex-col gap-4">
        <table className="w-full border-collapse border border-gray-300 text-left">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Email</th>
              <th className="border border-gray-300 px-4 py-2">Phone</th>
              <th className="border border-gray-300 px-4 py-2">Address</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                <td className="border border-gray-300 px-4 py-2">{user.phone}</td>
                <td className="border border-gray-300 px-4 py-2">{user.address || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialog Form */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <label>
              Name
              <Input {...register('name', { required: 'Name is required' })} />
              {errors.name && <span>{errors.name.message}</span>}
            </label>
            <label>
              Email
              <Input {...register('email', { required: 'Email is required' })} />
              {errors.email && <span>{errors.email.message}</span>}
            </label>
            <label>
              Phone
              <Input {...register('phone', { required: 'Phone number is required' })} />
              {errors.phone && <span>{errors.phone.message}</span>}
            </label>
            <label>
              Address
              <Input {...register('address')} />
            </label>
            <label>
              Password
              <Input type="password" {...register('password', { required: 'Password is required' })} />
              {errors.password && <span>{errors.password.message}</span>}
            </label>
            <DialogFooter>
              <Button type="submit">Add User</Button>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyUser;
