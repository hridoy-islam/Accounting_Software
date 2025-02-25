import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  loginUser,
  resetError
} from '@/redux/features/authSlice';
import { AppDispatch } from '@/redux/store';
import { useRouter } from '@/routes/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import * as z from 'zod';
import google from "../../../../assets/imges/home/logos/google.png"
import facebook from "../../../../assets/imges/home/logos/facebook.png"

const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z.string()
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const router = useRouter();
  const {user, loading, error } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const defaultValues = {
    email: '',
    password: ''
  };
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: UserFormValue) => {
    await dispatch(loginUser(data));

    // Check the user's role and redirect accordingly
    if (user) {
      if (user.role === 'company') {
        console.log('Redirecting to company dashboard');
        router.push(`/admin/company/${user._id}`);
      } else if (user.role === 'user') {
        console.log('User company ID:', user.companyId);
        router.push(`/admin/company/${user.companyId}`);
      } else {
        router.push('/admin');
      }
    }
  };




  useEffect(() => {
    // Reset the error when the component mounts
    dispatch(resetError());
  }, [dispatch]);

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-6 w-4/5 justify-center items-center">
          <div className="space-y-2 w-full">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='font-semibold'>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email..."
                      disabled={loading}
                      {...field}
                      className='py-6 rounded-xl '
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2 w-full">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='font-semibold'>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password..."
                      disabled={loading}
                      {...field}
                      className='py-6 rounded-xl'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

            <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
              Remember me
              </label>
            </div>

            <Link
              to="/forgot-password"
              className="text-sm text-[#a78bfa] hover:text-black"
            >
              Forgot Password?
            </Link>
            </div>

          <Button disabled={loading} type="submit" className="w-full rounded-xl text-white bg-black hover:bg-accent hover:text-white py-6">
            Login
          </Button>
          {error && <Badge className="mt-2 text-red-500">{error}</Badge>}
            <div className='w-full flex items-center justify-between gap-x-2'>
            <div className='flex-1 h-0.5 bg-gray-400'></div>
            <p className="text-center text-sm text-gray-800 px-2">Or Continue With</p>
            <div className='flex-1 h-0.5 bg-gray-400'></div>
            </div>
          <div>
            <div className="flex justify-center space-x-4">
            <Link to="#">
              <img src={google} alt="Google" className="h-10 w-10 mr-2" />
            </Link>
            <Link to="#">
              <img src={facebook} alt="Facebook" className="h-10 w-10 mr-2" />
            </Link>
            </div>
          </div>


         
        </form>
      </Form>
    </>
  );
}
