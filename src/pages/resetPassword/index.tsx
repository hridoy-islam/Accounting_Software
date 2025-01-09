import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRouter } from '@/routes/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';

const formSchema = z.object({
  currentPassword: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, { message: 'Password must be at least 6 characters' })
});

type UserFormValue = z.infer<typeof formSchema>;

export default function ResetPassword() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const defaultValues = {
    currentPassword: '',
    password: '',
    confirmPassword: ''
  };

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: UserFormValue) => {
    const expectedCurrentPassword = 'correctPassword'; // Replace with a secure API call to fetch user's current password

    if (data.currentPassword !== expectedCurrentPassword) {
      setError('Current password is incorrect');
      return;
    }

    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Add your password reset API call here
      // Example:
      // await resetPassword(data.password);

      setMessage('Password changed successfully');

      // Optional: Redirect after successful password reset
      setTimeout(() => router.push('/admin'), 2000);
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container grid h-full flex-col items-center justify-center bg-primary lg:max-w-none lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[480px] lg:p-8">
        <Card className="p-6">
          <div className="mb-2 flex flex-col space-y-2 text-left">
            <div className="mb-5 space-x-3">
              <h1 className="text-md font-semibold tracking-tight">
                Enter new password
              </h1>

              {error && (
                <div className="flex flex-col items-start justify-start mt-4">
                  <p className="text-sm text-red-500">{error}</p>
                  {error === 'Current password is incorrect' && (
                    <div
                  
                      onClick={() => router.push('/forgot-password')}
                      className="mt-2 text-sm text-blue-500 hover:underline"                    >
                      Forgot Password?
                    </div>
                  )}
                </div>
              )}
              {message && <p className="text-sm text-[#3b82f6]">{message}</p>}
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-4"
              >
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your current password..."
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your new password..."
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm your new password..."
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  disabled={loading}
                  className="ml-auto w-full bg-background text-white hover:bg-background"
                  type="submit"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            </Form>
          </div>
        </Card>
      </div>
    </div>
  );
}
