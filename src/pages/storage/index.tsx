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

import { useSelector } from 'react-redux';


  
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
        status: '', 
        auditStatus: '', 
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
        const formattedData = {
          ...data,
          companyId: id,
          openingBalance,
          status: data.status === 'true', // Convert string 'true' to boolean true
          auditStatus: data.auditStatus === 'true', // Convert string 'true' to boolean true 
        };
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
      setValue('status', storage.status ? 'true' : 'false'); // Map to 'true'/'false'
      setValue('auditStatus', storage.auditStatus ? 'true' : 'false'); // Map to 'true'/'false'
      setIsDialogOpen(true);
    };
  
    const handleDialogClose = () => {
      setStorageToEdit(null);
      setIsDialogOpen(false);
      reset();
    };


   
  
    return (
      <div className="  flex flex-col gap-4">
       
            
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
                  <TableHead>Balance</TableHead>
                  <TableHead>Opening Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Audit Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {storages.map((storage) => (
                  <TableRow key={storage._id} >
                    <TableCell>{storage.storageName}</TableCell>
                    <TableCell className='font-semibold'>£{(storage.openingBalance.toFixed(2))}</TableCell>
                    <TableCell>{moment(storage.openingDate).format('DD-MM-YYYY')}</TableCell>
                    <TableCell>{storage.status ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{storage.auditStatus ? 'Yes' : 'No'}</TableCell>
                    <TableCell className="space-x-4">
                      <Button
                        variant="ghost"
                        className="bg-theme text-white hover:bg-theme/80"
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
  
                {/* Select for Status */}
                <Label htmlFor="status">Status</Label>
                <select {...register('status', { required: true })} className="w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500">
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
  
                {/* Select for Audit Status */}
                <Label htmlFor="auditStatus">Audit Status</Label>
                <select {...register('auditStatus', { required: true })} className="w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500">
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
  
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
  