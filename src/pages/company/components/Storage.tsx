import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axiosInstance from '@/lib/axios';
import moment from 'moment';
import { Pen } from 'lucide-react';

const StoragePage = () => {
  const [storages, setStorages] = useState<any>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [storageToEdit, setStorageToEdit] = useState<any>(null);
  const { id } = useParams();
  const [initialLoading, setInitialLoading] = useState(true);

  const { register, handleSubmit, setValue, reset } = useForm({
    defaultValues: {
      storageName: '',
      openingBalance: '',
      openingDate: '',
    },
  });

  const fetchData = async () => {
    try {
      if (initialLoading) setInitialLoading(true);
      const response = await axiosInstance.get(`/storages?companyId=${id}`);
      setStorages(response.data.data.result);
    } catch (error) {
      console.error('Error fetching storages:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data) => {
    try {
      const openingBalance = parseInt(data.openingBalance);
      const formattedData = { ...data, companyId: id, openingBalance };

      if (storageToEdit) {
        // Edit existing storage
        await axiosInstance.patch(`/storages/${storageToEdit._id}`, formattedData);
      } else {
        // Add new storage
        await axiosInstance.post('/storages', formattedData);
      }

      fetchData(); // Refresh data
      setIsDialogOpen(false); // Close dialog
      reset(); // Reset form
    } catch (error) {
      console.error('Error submitting storage:', error);
    }
  };

  const handleEdit = (storage) => {
    setStorageToEdit(storage);
    setValue('storageName', storage.storageName);
    setValue('openingBalance', storage.openingBalance);
    setValue('openingDate', moment(storage.openingDate).format('YYYY-MM-DD'));
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setStorageToEdit(null);
    setIsDialogOpen(false);
    reset();
  };

  return (
    <div className="py-6">
      <div className="rounded-md bg-white p-4 shadow-lg">
        <h1 className="mb-8 text-2xl font-semibold">Storages</h1>

        <div className="flex justify-end mb-4">
          <Button
            variant="theme"
            onClick={() => {
              setStorageToEdit(null);
              setIsDialogOpen(true);
              reset();
            }}
          >
            Add Storage
          </Button>
        </div>

        <div className="flex flex-col gap-4 pb-4">
          <Table className="w-full border-collapse">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Opening Balance</TableHead>
                <TableHead>Opening Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Audit Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {storages.map((storage) => (
                <TableRow key={storage._id}>
                  <TableCell>{storage.storageName}</TableCell>
                  <TableCell>{storage.openingBalance}</TableCell>
                  <TableCell>{moment(storage.openingDate).format('DD-MM-YYYY')}</TableCell>
                  <TableCell>{storage.status ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{storage.auditStatus ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="space-x-4">
                    <Button
                      variant="ghost"
                      className="bg-[#a78bfa] text-white hover:bg-[#a78bfa]/80"
                      size="icon"
                      onClick={() => handleEdit(storage)}
                    >
                      <Pen className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Dialog Form */}
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {storageToEdit ? 'Edit Storage' : 'Add New Storage'}
              </DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <Label htmlFor="storageName">Storage Name</Label>
              <Input {...register('storageName', { required: true })} />

              <Label htmlFor="openingBalance">Opening Balance</Label>
              <Input type="number" {...register('openingBalance', { required: true })} />

              <Label htmlFor="openingDate">Opening Date</Label>
              <Input type="date" {...register('openingDate', { required: true })} />

              <DialogFooter>
                <Button variant="default" onClick={handleDialogClose}>
                  Cancel
                </Button>
                <Button variant="theme" type="submit">
                  {storageToEdit ? 'Save Changes' : 'Add Storage'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default StoragePage;
