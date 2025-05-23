import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { registerUser } from '@/redux/features/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { useToast } from '@/components/ui/use-toast';
import { convertToLowerCase } from '@/lib/utils';
import { fetchUserProfile } from '@/redux/features/profileSlice';

export default function CreateUser({ onUserCreated }) {
  const { user } = useSelector((state: any) => state.auth);
  const { toast } = useToast();
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch<AppDispatch>();
  const { profileData } = useSelector((state: any) => state.profile);

  const onCompanySubmit = async (data) => {
    data.role = 'user'; // Set the role
    data.email = convertToLowerCase(data.email);
    if (user?.role === 'company') {
      data.company = user?._id;
    }
    if (user?.role === 'creator') {
      dispatch(fetchUserProfile(user?._id));
      data.company = profileData.company;
    }
    setIsLoading(true); // Set loading state
    setError(null); // Reset any previous errors

    try {
      await dispatch(registerUser(data)).unwrap(); // Dispatch registerUser with data
      reset(); // Reset form fields
      onUserCreated(); // Trigger the refresh for the director list
      toast({
        title: 'User created successfully!'
      });
    } catch (error) {
      const errorMessage = 'This Email Already Exists'; // Adjust based on your API's response structure
      toast({
        variant: 'destructive',
        title: errorMessage
      });
      reset();
    } finally {
      setIsLoading(false); // Reset loading state
      setIsCompanyDialogOpen(false); // Close the dialog
    }
  };

  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-2xl font-bold">User List</h1>

      <Dialog open={isCompanyDialogOpen} onOpenChange={setIsCompanyDialogOpen}>
        <DialogTrigger asChild>
          <Button className='hover:bg-[#a78bfa] hover:text-white'>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create User
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new User to your list. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCompanySubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  {...register('name')}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  className="col-span-3"
                  required
                />
              </div>
              {error && <p className="text-red-500">{error}</p>}
            </div>
            <DialogFooter>
              <Button className="hover:bg-theme hover:text-white" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex h-10 w-full flex-col items-center justify-center">
                  <div className="flex flex-row items-center gap-4">
                    <p className="font-semibold">Please Wait..</p>
                    <div className="h-5 w-5 animate-spin rounded-full border-4 border-dashed border-theme"></div>
                  </div>
                </div>
                ) : (
                  'Save User'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
