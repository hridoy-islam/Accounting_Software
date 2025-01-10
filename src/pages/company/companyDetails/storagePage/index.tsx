import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import CompanyNav from '../../components/CompanyNav';

interface Storage {
  id: number;
  storageName: string;
  openingBalance: number;
  openingDate: string;
  logo?: string;
  status: boolean;
  auditStatus: boolean;
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
    const newStorage = {
      id: storages.length + 1, // Simulate auto-increment ID
      ...formData,
    } as Storage;

    setStorages([...storages, newStorage]);
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
              <th className="border border-gray-300 px-4 py-2">ID</th>
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Opening Balance</th>
              <th className="border border-gray-300 px-4 py-2">Opening Date</th>
              <th className="border border-gray-300 px-4 py-2">Logo</th>
              <th className="border border-gray-300 px-4 py-2">Status</th>
              <th className="border border-gray-300 px-4 py-2">Audit Status</th>
            </tr>
          </thead>
          <tbody>
            {storages.map((storage) => (
              <tr key={storage.id}>
                <td className="border border-gray-300 px-4 py-2">{storage.id}</td>
                <td className="border border-gray-300 px-4 py-2">{storage.storageName}</td>
                <td className="border border-gray-300 px-4 py-2">{storage.openingBalance}</td>
                <td className="border border-gray-300 px-4 py-2">{storage.openingDate}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {storage.logo ? <img src={storage.logo} alt="Logo" className="h-8 w-8" /> : 'N/A'}
                </td>
                <td className="border border-gray-300 px-4 py-2">{storage.status ? 'Active' : 'Inactive'}</td>
                <td className="border border-gray-300 px-4 py-2">{storage.auditStatus ? 'Enabled' : 'Disabled'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialog Form */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Storage</DialogTitle>
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
            <Button onClick={handleSubmit}>Add Storage</Button>
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
