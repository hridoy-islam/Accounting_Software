import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { TableBody, TableCell, TableRow } from '@/components/ui/table';
import { usePermission } from '@/hooks/usePermission';

const BankDetailsPage = () => {
  const { id, bankId } = useParams();
  const [bank, setBank] = useState(null);
  const [formData, setFormData] = useState({});
  const [isModified, setIsModified] = useState(false);
  const navigate = useNavigate();
  const { hasPermission } = usePermission();

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(`/bank/${bankId}`);
      setBank(response.data.data);
      setFormData(response.data.data);
    } catch (error) {
      console.error('Error fetching bank details:', error);
    }
  };

  useEffect(() => {
    if (bankId) {
      fetchData();
    }
  }, [bankId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
    setIsModified(true);
  };

  const handleSubmit = async () => {
    try {
      const response = await axiosInstance.patch(`/bank/${bankId}`, formData);
      if (response.data.success) {
        setIsModified(false);
        fetchData();
        toast({
          title: 'Bank Details Updated successfully',
          className: 'bg-theme border-none text-white'
        });
      } else {
        toast({
          title: 'Error updating bank',
          className: 'bg-destructive border-none text-white'
        });
      }
    } catch (error) {
      toast({
        title: 'Error updating bank',
        className: 'bg-destructive border-none text-white'
      });
    }
  };

  if (!bank) {
    return (
      <div className="flex justify-center">
        <TableBody>
          <TableRow>
            <TableCell colSpan={9} className="h-32 text-center">
              <div className="flex h-10 w-full flex-col items-center justify-center">
                <div className="flex flex-row items-center gap-4">
                  <p className="font-semibold">Please Wait..</p>
                  <div className="h-5 w-5 animate-spin rounded-full border-4 border-dashed border-theme"></div>
                </div>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <div className="flex flex-row items-start justify-end">
          <Button
            className="bg-theme text-white "
            size={'sm'}
            onClick={() => navigate(`/admin/company/${id}/invoice/bank-list`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back To Bank List
          </Button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {/* Name */}
            <InputField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />

            {/* Account No */}
            <InputField
              label="Account Number"
              name="accountNo"
              value={formData.accountNo}
              onChange={handleInputChange}
            />

            {/* Sort Code */}
            <InputField
              label="Sort Code"
              name="sortCode"
              value={formData.sortCode}
              onChange={handleInputChange}
            />

            {/* Beneficiary */}
            <InputField
              label="Beneficiary"
              name="beneficiary"
              value={formData.beneficiary}
              onChange={handleInputChange}
            />
          </div>
          {hasPermission('Invoice', 'edit') && isModified && (
            <div className="flex justify-end pt-4">
              <Button
                type="button"
                className="bg-theme text-white"
                onClick={handleSubmit}
              >
                Update Bank
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, type = 'text' }) => (
  <div className="flex flex-col rounded-lg p-2">
    <span className="text-lg font-semibold text-gray-700">{label}</span>
    <input
      type={type}
      name={name}
      value={value || ''}
      onChange={onChange}
      className="rounded border border-gray-300 p-2 text-gray-800"
    />
  </div>
);

export default BankDetailsPage;
