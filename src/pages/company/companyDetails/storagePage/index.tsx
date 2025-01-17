import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import CompanyNav from '../../components/CompanyNav';
import { Pen, Trash } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

const StoragePage: React.FC = () => {
  const [storages, setStorages] = useState<Storage[]>(mockStorages);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<Storage>>({
    storageName: '',
    openingBalance: 0,
    openingDate: '',
    logo: '',
    status: true,
    auditStatus: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          logo: reader.result as string, // The result is a data URL
        });
      };
      reader.readAsDataURL(file); // Convert the file to a data URL
    }
  };

  const handleSubmit = () => {
    if (formData.id) {
      // If formData.id exists, update the existing storage entry
      setStorages(
        storages.map((storage) =>
          storage.id === formData.id ? { ...storage, ...formData } : storage
        )
      );
    } else {
      // If no id, it's a new entry, so create a new storage
      const newStorage = {
        id: storages.length + 1, // Simulate auto-increment ID
        ...formData,
      } as Storage;
      setStorages([...storages, newStorage]);
    }
  
    // Reset form and close dialog
    setFormData({
      storageName: '',
      openingBalance: 0,
      openingDate: '',
      logo: '',
      status: true,
      auditStatus: true,
    });
    setIsDialogOpen(false);
  };
  

  const handleDelete = (id: number) => {
    setStorages(storages.filter(storage => storage.id !== id));
  };

  const handleEdit = (storage: Storage) => {
    setFormData(storage);
    setIsDialogOpen(true);
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
                onClick={() => handleEdit(storage)}
                variant="ghost"
                className="bg-[#a78bfa] text-white hover:bg-[#a78bfa]/80"
                size="icon"
              >
                <Pen className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => handleDelete(storage.id)}
                variant="ghost"
                className="bg-red-500 text-white hover:bg-red-500/90"
                size="icon"
              >
                <Trash className="h-4 w-4" />
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
            <DialogTitle>{formData.id ? 'Edit' : 'Add'} Storage</DialogTitle>
          </DialogHeader>
          <form className="space-y-4 p-4 flex flex-col gap-4">
            <label >
              Storage Name
              <Input
                name="storageName"
                className='mt-2'
                value={formData.storageName || ''}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              Opening Balance
              <Input
                name="openingBalance"
                 className='mt-2'
                type="number"
                value={formData.openingBalance || 0}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              Opening Date
              <Input
                name="openingDate"
                 className='mt-2'
                type="date"
                value={formData.openingDate || ''}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
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
            </label>
            <div className="flex items-center gap-2">
              <label htmlFor="status">Status</label>
              <Switch
                id="status"
                checked={formData.status || false}
                onCheckedChange={(checked) => setFormData({ ...formData, status: checked })}
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="auditStatus">Audit Status</label>
              <Switch
                id="auditStatus"
                checked={formData.auditStatus || false}
                onCheckedChange={(checked) => setFormData({ ...formData, auditStatus: checked })}
              />
            </div>
          </form>
          <DialogFooter>
            <Button variant='theme' onClick={handleSubmit}>{formData.id ? 'Update' : 'Add'} Storage</Button>
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
