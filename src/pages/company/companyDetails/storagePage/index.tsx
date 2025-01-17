import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import CompanyNav from '../../components/CompanyNav';
import { Pen } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import axiosInstance from '@/lib/axios'
import { useParams } from 'react-router-dom';
import ErrorMessage from '@/components/shared/error-message';
import { useForm } from 'react-hook-form';
import { toast } from '@/components/ui/use-toast';
interface Storage {
  id: number;
  storageName: string;
  openingBalance: number;
  openingDate: string;
  logo?: string;
  status: boolean;
  auditStatus: boolean;
  createdBy?: string;
}

const mockStorages: Storage[] = [
  {
    id: 1,
    storageName: "Main Warehouse",
    openingBalance: 1000,
    openingDate: "2025-01-01",
    logo: " ",
    status: true,
    auditStatus: true,
  },
  {
    id: 2,
    storageName: "Secondary Warehouse",
    openingBalance: 1500,
    openingDate: "2025-02-01",
    logo: " ",
    status: false,
    auditStatus: false,
  },
];

const StoragePage = () => {
  const [storages, setStorages] = useState<Storage[]>(mockStorages);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { id } = useParams();
  const [storageToEdit, setStorageToEdit] = useState<any>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(`/storages?companyId=${id}`);
      setStorages(response.data.data.result);
    } catch (error) {
      console.error('Error fetching storages:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data: any) => {
    if (storageToEdit) {
      await axiosInstance.patch(`/storages/${storageToEdit?._id}`, data);
      toast({
        title: 'Storage Updated successfully',
        className: 'bg-background border-none text-white'
      });
      fetchData();
      setStorageToEdit(null);
    } else {
      const formattedData = { ...data, companyId: id };
      await axiosInstance.post('/storages', formattedData);
      fetchData();
    }

    reset();
    setIsDialogOpen(false);
    setStorageToEdit(null);
  };

  const editStorage = (storage) => {
    setIsDialogOpen(true);
    setStorageToEdit(storage);
    reset(storage);
  };



  return (
    <div className="py-6">
      <CompanyNav />
      <h1 className="mb-8 text-2xl font-semibold">Storages</h1>

      <div className="flex justify-end mb-4">
        <Button variant='theme' onClick={() => setIsDialogOpen(true)}>Add Storage</Button>
      </div>

      <div className="flex flex-col gap-4">
        <Table className="w-full border-collapse ">
          <TableHeader>
            <TableRow>
              <TableHead >Name</TableHead>
              <TableHead >Opening Balance</TableHead>
              <TableHead >Opening Date</TableHead>
              <TableHead >Logo</TableHead>
              <TableHead >Status</TableHead>
              <TableHead >Audit Status</TableHead>
              <TableHead >Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {storages.map((storage) => (
              <TableRow key={storage.id}>
                <TableCell >{storage.storageName}</TableCell>
                <TableCell >{storage.openingBalance}</TableCell>
                <TableCell >{storage.openingDate}</TableCell>
                <TableCell >
                  {storage.logo ? (
                    <img src={storage.logo} alt="Logo" className="h-8 w-8 " />
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell >
                  <Switch
                    checked={storage.status}
                    onCheckedChange={(checked) =>
                      setStorages(
                        storages.map((s) =>
                          s.id === storage.id ? { ...s, status: checked } : s
                        )
                      )
                    }
                  />
                </TableCell>
                <TableCell >
                  <Switch
                    checked={storage.auditStatus}
                    onCheckedChange={(checked) =>
                      setStorages(
                        storages.map((s) =>
                          s.id === storage.id ? { ...s, auditStatus: checked } : s
                        )
                      )
                    }
                  />
                </TableCell>
                <TableCell className=" space-x-4">
                  <Button
                    onClick={() => editStorage(storage)}
                    variant="ghost"
                    className="bg-[#a78bfa] text-white hover:bg-[#a78bfa]/80"
                    size="icon"
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{storageToEdit ? 'Edit' : 'Add'} Storage</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 flex flex-col gap-4">
            <label >
              Storage Name
              <Input
                
                className='mt-2'
                {...register('storageName', { required: 'Storage Name is required' })}
              />
              <ErrorMessage message={errors.storageName?.message?.toString()} />
            </label>
            <label>
              Opening Balance
              <Input
                className='mt-2'
                type="number"
                {...register('openingBalance', { required: 'Opening Balance is required' })}
              />
              <ErrorMessage message={errors.openingBalance?.message?.toString()} />
            </label>
            <label>
              Opening Date
              <Input
                className='mt-2'
                type="date"
                {...register('openingDate', { required: 'Opening Date is required' })}
              />
              <ErrorMessage message={errors.openingDate?.message?.toString()} />
            </label>
            {/* <label>
              Logo Upload
              <input
               className='mt-2'
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {formData.logo && (
                <div>
                  <img src={formData.logo} alt="Preview" className="h-16 w-16 mt-2" />
                </div>
              )}
            </label> */}
            <div className="flex items-center gap-2">
              <label htmlFor="status">Status</label>
              <Switch
                id="status"
                checked={Boolean(storageToEdit?.status)}
                onCheckedChange={(checked) => setStorageToEdit({ ...storageToEdit, status: checked })}
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="auditStatus">Audit Status</label>
              <Switch
                id="auditStatus"
                checked={Boolean(storageToEdit?.auditStatus)}
                onCheckedChange={(checked) => setStorageToEdit({ ...storageToEdit, auditStatus: checked })}
              />
            </div>
          </form>
          <DialogFooter>
            <Button variant='theme' type='submit'>{storageToEdit ? 'Update' : 'Submit'} Storage</Button>
            <Button variant="default" className='border border-gray-400 hover:bg-black hover:text-white' onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoragePage;
