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
import axiosInstance from '@/lib/axios';
import { toast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { usePermission } from '@/hooks/usePermission';
import { useParams } from 'react-router-dom';

interface Method {
  id: number;
  name: string;
  companyId: string
}

export function Method() {
  const [methods, setMethods] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<any>(null);
  const [initialLoading, setInitialLoading] = useState(true); // New state for initial loading
  const {id} = useParams()
    const {hasPermission} = usePermission();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  const fetchData = async () => {
    try {
      if (initialLoading) setInitialLoading(true);
      const response = await axiosInstance.get(`/methods/company/${id}`);
      setMethods(response.data.data.result);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    } finally {
      setInitialLoading(false); // Disable initial loading after the first fetch
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data: any) => {
    const payload = { ...data, companyId: id };
    if (editingMethod) {
      await axiosInstance.patch(`/methods/${editingMethod?._id}`, payload);
      toast({
        title: 'Record Updated successfully',
        className: 'bg-background border-none text-white'
      });
      fetchData();
      setEditingMethod(null);
    } else {
      await axiosInstance.post('/methods', payload);
      fetchData();
    }
    reset();
    setDialogOpen(false);
    setEditingMethod(null);
  };

  const editData = (method) => {
    setDialogOpen(true);
    setEditingMethod(method);
    reset(method);
  };

  return (
    <div className="flex flex-col gap-4">
  

      <div className="space-y-4 rounded-lg bg-white shadow-md">
        <div className="p-4 ">
          <div className="flex  justify-between ">
            <h1 className=" text-2xl font-semibold">Methods</h1>
            {hasPermission('Method', 'create') && (
            <Button
              variant="theme"
              onClick={() => {
                setEditingMethod(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Method
            </Button>)}
          </div>
        </div>
        <div className="space-x-1">
          <div className="p-4">
            <Table className="">
              <TableHeader>
                <TableRow>
                  <TableHead>Method Name</TableHead>
                  {hasPermission('Method', 'edit') && (
                  <TableHead className="w-32 text-center">Actions</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {methods.map((method) => (
                  <TableRow key={method.id}>
                    <TableCell>{method.name}</TableCell>

                    {hasPermission('Method', 'edit') && (
                    <TableCell className="space-x-4 text-center ">
                      <Button
                        variant="ghost"
                        className="border-none bg-theme text-white hover:bg-[#a78bfa]/80"
                        size="icon"
                        onClick={() => editData(method)}
                      >
                        <Pen className="h-4 w-4" />
                      </Button>
                    </TableCell>)}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => setDialogOpen(open)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingMethod ? 'Edit Method' : 'New Method'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Method Name</Label>
                  <Input
                    id="name"
                    {...register('name', {
                      required: 'Name is required'
                    })}
                  />
                </div>
                <Button variant="theme" type="submit">
                  {editingMethod ? 'Save Changes' : 'Add Method'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
