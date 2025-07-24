import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { usePermission } from '@/hooks/usePermission';

const CustomerDetailsPage = () => {
  const { id, cid } = useParams();
  const [customer, setCustomer] = useState(null);
  const [formData, setFormData] = useState({});
  const [isModified, setIsModified] = useState(false);
  const navigate = useNavigate();
  const { hasPermission } = usePermission();

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(`/customer/${cid}`);
      setCustomer(response.data.data);
      setFormData(response.data.data);
    } catch (error) {
      console.error('Error fetching customer details:', error);
    }
  };

  useEffect(() => {
    if (cid) {
      fetchData();
    }
  }, [cid]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setIsModified(true);
  };

  const handleSubmit = async () => {
    try {
      const response = await axiosInstance.patch(`/customer/${cid}`, formData);
      if (response.data.success) {
        setIsModified(false);
        fetchData();
        toast({
          title: 'Record Updated successfully',
          className: 'bg-theme border-none text-white',
        });
      } else {
        toast({
          title: 'Error updating Customer',
          className: 'bg-destructive border-none text-white',
        });
      }
    } catch (error) {
      toast({
        title: 'Error updating Customer',
        className: 'bg-destructive border-none text-white',
      });
    }
  };

  return (
    <div>
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <div className="flex flex-row items-start justify-end">
          <Button
            className="bg-theme text-white"
            size="sm"
            onClick={() => navigate(`/admin/company/${id}/invoice/customer`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back To Customer List
          </Button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {/* Name */}
            <div className="flex flex-col p-2 rounded-lg">
              <label className="text-lg font-semibold text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData?.name || ''}
                onChange={handleInputChange}
                className="rounded border border-gray-300 p-2 text-gray-800"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col p-2 rounded-lg">
              <label className="text-lg font-semibold text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData?.email || ''}
                onChange={handleInputChange}
                className="rounded border border-gray-300 p-2 text-gray-800"
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col p-2 rounded-lg">
              <label className="text-lg font-semibold text-gray-700">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData?.phone || ''}
                onChange={handleInputChange}
                className="rounded border border-gray-300 p-2 text-gray-800"
              />
            </div>

            {/* Address */}
            <div className="flex flex-col p-2 rounded-lg">
              <label className="text-lg font-semibold text-gray-700">Address</label>
              <input
                type="text"
                name="address"
                value={formData?.address || ''}
                onChange={handleInputChange}
                className="rounded border border-gray-300 p-2 text-gray-800"
              />
            </div>

            {/* Bank Name */}
            <div className="flex flex-col p-2 rounded-lg">
              <label className="text-lg font-semibold text-gray-700">Bank Name</label>
              <input
                type="text"
                name="bankName"
                value={formData?.bankName || ''}
                onChange={handleInputChange}
                className="rounded border border-gray-300 p-2 text-gray-800"
              />
            </div>

            {/* Account No */}
            <div className="flex flex-col p-2 rounded-lg">
              <label className="text-lg font-semibold text-gray-700">Account No</label>
              <input
                type="text"
                name="accountNo"
                value={formData?.accountNo || ''}
                onChange={handleInputChange}
                className="rounded border border-gray-300 p-2 text-gray-800"
              />
            </div>

            {/* Sort Code */}
            <div className="flex flex-col p-2 rounded-lg">
              <label className="text-lg font-semibold text-gray-700">Sort Code</label>
              <input
                type="text"
                name="sortCode"
                value={formData?.sortCode || ''}
                onChange={handleInputChange}
                className="rounded border border-gray-300 p-2 text-gray-800"
              />
            </div>

            {/* Beneficiary */}
            <div className="flex flex-col p-2 rounded-lg">
              <label className="text-lg font-semibold text-gray-700">Beneficiary</label>
              <input
                type="text"
                name="beneficiary"
                value={formData?.beneficiary || ''}
                onChange={handleInputChange}
                className="rounded border border-gray-300 p-2 text-gray-800"
              />
            </div>
          </div>

          {isModified && hasPermission('Customer', 'edit') && (
            <div className="flex justify-end pt-4">
              <Button type="button" variant="theme" onClick={handleSubmit}>
                Update Customer
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsPage;
