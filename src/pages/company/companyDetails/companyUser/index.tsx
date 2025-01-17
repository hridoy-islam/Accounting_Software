import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CompanyNav from '../../components/CompanyNav';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useParams } from 'react-router-dom';  // Assuming you're using React Router for route params
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/axios'
import { Switch } from '@/components/ui/switch';


const CompanyUser: React.FC = () => {
  const [users, setUsers] = useState<any>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // New state for initial loading
  const user = useSelector((state: any) => state.auth.user); // Get user from Redux state
  const { companyId } = useParams();

  // Use react-hook-form
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit: SubmitHandler<TUser> = (data) => {
    if (!data.id || !data.name || !data.email || !data.phone || !data.password || !data.role || !data.status) {
      alert('All required fields must be filled.');
      return;
    }
    setUsers([...users, newUser]);

    // Reset form after submission
    reset();
    setIsDialogOpen(false);
  };


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

  return (

    <div className="py-6">
      <CompanyNav />

      <div className="rounded-md bg-white p-4 shadow-lg">

     
     
      <h1 className="mb-8 text-2xl font-semibold">Assigned Users</h1>
      <div className="flex justify-end mb-4">
        <Button variant='theme' onClick={() => setIsDialogOpen(true)}>Assign User</Button>
      </div>
      <div className="flex flex-col gap-4">
        <Table className="w-full border-collapse">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>
                  <Switch
                    checked={user.status}
                      onCheckedChange={(checked) =>
                        setUsers(
                          users.map((s) =>
                            s.id === user.id ? { ...s, auditStatus: checked } : s
                          )
                        )
                      }
                    />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

      </div>
      {/* Dialog Form */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <select className="w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500">
              {users.map((user) => (
                <option key={user._id} value={user._id}>{user.name}</option>))}
            </select>

            <DialogFooter>
              <Button variant="default" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button variant='theme' type="submit">Add User</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      </div>
    </div>
  );
};

export default CompanyUser;
