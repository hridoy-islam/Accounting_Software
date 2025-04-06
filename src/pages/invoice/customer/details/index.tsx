import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react'; 

import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast';

const CustomerDetailsPage = () => {
  const { id, cid } = useParams();
  const [customer, setCustomer] = useState(null);
  const [formData, setFormData] = useState({});
  const [isModified, setIsModified] = useState(false);
  const navigate = useNavigate();

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



  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setIsModified(true); // Set modified state to true
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const response = await axiosInstance.patch(`/customer/${cid}`, formData);
      if (response.data.success) {
        setIsModified(false); 
        fetchData();
        
        toast({ title: "Record Updated successfully", className: "bg-theme border-none text-white", });
      } else {
        toast({ title: "Error updating Customer ", className: "bg-destructive border-none text-white", });

      }
    } catch (error) {
      toast({ title: "Error updating Customer ", className: "bg-destructive border-none text-white", });
    }
  };

 
  return (
    <div>
      <div className="bg-white shadow-lg rounded-lg p-8">
        <div className="flex flex-row items-start justify-end">
         
          <div>
            <Button
              className="bg-theme text-white"
              size={'sm'}
              onClick={() => navigate(`/admin/company/${id}/invoice/customer`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back To Customer List
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {/* Name */}
            <div className="flex flex-col   p-2 rounded-lg   transition">
              <div className="flex items-center   ">
                <span className="text-lg font-semibold text-gray-700">Name</span>
              </div>
              <input
                type="text"
                name="name"
                value={formData?.name || ''}
                onChange={handleInputChange}
                className="text-gray-800 p-2 rounded border border-gray-300"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col   p-2 rounded-lg  ">
              <div className="flex items-center   ">
                <span className="text-lg font-semibold text-gray-700">Email</span>
              </div>
              <input
                type="email"
                name="email"
                value={formData?.email || ''}
                onChange={handleInputChange}
                className="text-gray-800 p-2 rounded border border-gray-300"
              />
            </div>

      
            <div className="flex flex-col   p-2 rounded-lg  ">
              <div className="flex items-center   ">
                <span className="text-lg font-semibold text-gray-700">Phone</span>
              </div>
              <input
                type="tel"
                name="phone"
                value={formData?.phone || ''}
                onChange={handleInputChange}
                className="text-gray-800 p-2 rounded border border-gray-300"
              />
            </div>

            {/* Address */}
            <div className="flex flex-col   p-2 rounded-lg  ">
              <div className="flex items-center   ">
                <span className="text-lg font-semibold text-gray-700">Address</span>
              </div>
              <input
                type="text"
                name="address"
                value={formData?.address || ''}
                onChange={handleInputChange}
                className="text-gray-800 p-2 rounded border border-gray-300"
              />
            </div>

            

            

           
          </div>

          {isModified && (
            <div className="flex justify-end pt-4">
              <Button
                type="button"
                variant='theme'
                onClick={handleSubmit}
              >
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