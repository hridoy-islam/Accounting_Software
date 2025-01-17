import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom'; // Assuming you're using React Router for route params
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/axios';
import { Switch } from '@/components/ui/switch';

const CompanyUser: React.FC = () => {
  const [users, setUsers] = useState<any>([]);
  const [assignUser, setAssignUser] = useState<any>([]); // This will store assigned users
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // New state for initial loading
  const user = useSelector((state: any) => state.auth.user); // Get user from Redux state
  const { id } = useParams();

  // Use react-hook-form
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Fetch all users created by the current user
  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(`/users?createdBy=${user._id}`);
      setUsers(response.data.data.result);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setInitialLoading(false); // Disable initial loading after the first fetch
    }
  };

  // Fetch assigned users for the company
  const fetchAssignedUsers = async () => {
    try {
      const response = await axiosInstance.get(`/companies/${id}`);
      const result = response.data.data.assignUser;

      console.log(response.data.data)
      if (result) {
        setAssignUser(result); // Set the existing assigned users
      } else {
        setAssignUser([]); // Default to an empty array if assignUser is undefined
      }
    } catch (error) {
      console.error('Error fetching assigned users:', error);
    }
  };

  // Run both fetch functions on component mount
  useEffect(() => {
    fetchData();
    fetchAssignedUsers();
  }, []);



  // Handle form submission to add user to assignUser array
  const onSubmit = async (data: any) => {
    try {
      const newUserId = data.userId; // The selected user's ID
      const updatedAssignUser = [...assignUser, newUserId]; // Add the new user ID to the array

      const response = await axiosInstance.patch(`/companies/${id}`, {
        assignUser: updatedAssignUser,
      });

      setAssignUser(response.data.data.assignUser);
    
      setIsDialogOpen(false); // Close dialog
      reset(); // Reset the form
    } catch (error) {
      console.error('Error assigning user:', error);
    }
  };

  return (
    <div className="py-6">
      <div className="rounded-md bg-white p-4 shadow-lg">
        <h1 className="mb-8 text-2xl font-semibold">Assigned Users</h1>
        <div className="flex justify-end mb-4">
          <Button variant="theme" onClick={() => setIsDialogOpen(true)}>Assign User</Button>
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
            {
  assignUser.map((item: any, index: number) => (
    <TableRow key={index}> {/* Use item._id for key */}
      <TableCell>{item.name}</TableCell> {/* Access the 'name' of each user */}
      {/* You can use the Switch component and handle status change */}
      <TableCell>
        <Switch
          checked={item.status}
          onCheckedChange={(checked) =>
            setAssignUser(
              assignUser.map((s: any, idx: number) =>
                idx === index ? { ...s, status: checked } : s
              )
            )
          }
        />
      </TableCell>
    </TableRow>
  ))
}

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
              <select
                {...register('userId', { required: true })}
                className="w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500"
              >
                {users.map((user: any) => (
                  <option key={user._id} value={user._id}>{user.name}</option>
                ))}
              </select>

              <DialogFooter>
                <Button variant="default" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button variant="theme" type="submit">Add User</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CompanyUser;
