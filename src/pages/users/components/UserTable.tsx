import { useEffect, useState } from 'react';
import { Pen, Plus, Trash } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';

export interface TCompany {
  id: string;
  companyName: string;
  email: string;
  phone: string;
  companyAddress: string;
  assignUser?: string[];
  logo?: string;
}

const companies: TCompany[] = [
  {
    id: '1',
    email: 'company1@example.com',
    companyName: 'Company 1',
    phone: '1234567890',
    companyAddress: 'ABC',
    logo: ''
  },
  {
    id: '2',
    email: 'company2@example.com',
    companyName: 'Company 2',
    phone: '0987654321',
    companyAddress: 'XYZ',
    logo: ''
  }
];

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
  companyId?: string ;
}

export function UserTable() {
  const [users, setUsers] = useState<TUser[]>([
    {
      createdBy: 'admin',
      otp: '',
      otpExpiry: null,
      id: '673b24cdcd2222fd626678c5',
      name: 'Kishour Zadid',
      email: 'kishour@outlook.com',
      role: 'user',
      status: 'active',
      isDeleted: false,
      authroized: false,
      phone: '0987654321',
      password: 'password456',
      companyId: '1'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<TUser | null>(null);
  const [currentPage, setCurrentPage] = useState('1');
  const itemsPerPage = 5;

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (parseInt(currentPage, 10) - 1) * itemsPerPage,
    parseInt(currentPage, 10) * itemsPerPage
  );

  const { register, handleSubmit, reset, control } = useForm<TUser>({
    defaultValues: editingUser || {
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'user',
      status: 'active',
      isDeleted: false,
      authroized: false,
      companyId: '' // Set default value for companyId
    }
  });

  useEffect(() => {
    if (editingUser) {
      reset(editingUser);
    }
  }, [editingUser, reset]);

  const onSubmit = (data: TUser) => {
    if (editingUser) {
      setUsers(
        users.map((user) => (user.id === editingUser.id ? { ...user, ...data } : user))
      );
      setEditingUser(null);
    } else {
      const newId = (Math.max(...users.map((u) => parseInt(u.id, 10)), 0) + 1).toString();
      const { id, ...restData } = data;
      setUsers([...users, { id: newId, ...restData }]);
    }
    setDialogOpen(false);
    reset();
  };

  const handleDelete = (id: string) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  const goToPage = (page: string) => {
    const pageNumber = parseInt(page, 10);
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber.toString());
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">User Management</h1>
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center justify-between space-x-4">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          <Button
            className="bg-[#a78bfa] text-white hover:bg-[#a78bfa]/80"
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
      <div className="rounded-md bg-white p-4 shadow-2xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="text-center">{user.name}</TableCell>
                <TableCell className="text-center">{user.email}</TableCell>
                <TableCell className="text-center">{user.phone}</TableCell>
                <TableCell className="text-center">
                  {user.companyId ? companies.find((company) => company.id === user.companyId)?.companyName : '-'}
                </TableCell>
                <TableCell className="space-x-4 text-center">
                  <Button
                    variant="ghost"
                    className="border-none bg-[#a78bfa] text-white hover:bg-[#a78bfa]/80"
                    size="icon"
                    onClick={() => {
                      setEditingUser(user);
                      setDialogOpen(true);
                    }}
                  >
                    <Pen className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="border-none bg-red-500 text-white hover:bg-red-500/90"
                    size="icon"
                    onClick={() => handleDelete(user.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 flex flex-col items-center justify-center gap-4 space-y-2 sm:flex-row sm:space-y-0">
        <Button
          disabled={parseInt(currentPage, 10) === 1}
          onClick={() => goToPage((parseInt(currentPage, 10) - 1).toString())}
        >
          Previous
        </Button>
        <div className="flex items-center gap-2">
          Page {currentPage} of {totalPages}
        </div>
        <Button
          disabled={parseInt(currentPage, 10) === totalPages}
          onClick={() => goToPage((parseInt(currentPage, 10) + 1).toString())}
        >
          Next
        </Button>
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
                <Label htmlFor="companyId">Company</Label>
                <Controller
  name="companyId"
  control={control}
  render={({ field }) => (
    <Select {...field} value={field.value } onValueChange={field.onChange}>
      <SelectTrigger>
        <span>
          {companies.find((company) => company.id === field.value)?.companyName || 'Select a company'}
        </span>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">None</SelectItem> {/* Use null for "None" option */}
        {companies.map((company) => (
          <SelectItem key={company.id} value={company.id}>
            {company.companyName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )}
/>

              </div>
            </div>
            <Button type="submit" className="w-full">Save</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
