import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import CompanyNav from '../../components/CompanyNav';
import { Pen, Trash } from 'lucide-react';

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
    <div className="container mx-auto p-6">
      <CompanyNav />
      <h1 className="mb-8 text-2xl font-semibold">Storages</h1>

      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsDialogOpen(true)}>Add Storage</Button>
      </div>

      <div className="flex flex-col gap-4">
        <table className="w-full border-collapse border border-gray-300 text-left">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-center">Name</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Opening Balance</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Opening Date</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Logo</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Status</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Audit Status</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {storages.map((storage) => (
              <tr key={storage.id}>
                <td className="border border-gray-300 px-4 py-2 text-center">{storage.storageName}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">{storage.openingBalance}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">{storage.openingDate}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {storage.logo ? <img src={storage.logo} alt="Logo" className="h-8 w-8" /> : 'N/A'}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
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
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
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
                </td>
                <td className="border border-gray-300 px-4 py-2 space-x-4 text-center">
                  <Button onClick={() => handleEdit(storage)}  variant="ghost"
                      className="border-none bg-[#a78bfa] text-white hover:bg-[#a78bfa]/80"
                      size="icon"><Pen className="h-4 w-4" /></Button>
                  <Button onClick={() => handleDelete(storage.id)} variant="ghost"
                      className="border-none bg-red-500 text-white hover:bg-red-500/90"
                      size="icon"><Trash className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialog Form */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Edit' : 'Add'} Storage</DialogTitle>
          </DialogHeader>
          <form className="space-y-4">
            <label>
              Storage Name
              <Input
                name="storageName"
                value={formData.storageName || ''}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              Opening Balance
              <Input
                name="openingBalance"
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
                type="date"
                value={formData.openingDate || ''}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              Logo Upload
              <input
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
            <Button onClick={handleSubmit}>{formData.id ? 'Update' : 'Add'} Storage</Button>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoragePage;
