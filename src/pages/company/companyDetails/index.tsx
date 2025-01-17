import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DropdownMenuCheckboxItemProps } from '@radix-ui/react-dropdown-menu';
import axiosInstance from '@/lib/axios'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import History from '../components/History';
import TransactionPage from '../components/TransactionPage';
import StoragePage from '../components/Storage';
import CompanyUser from '../components/Users';

const CompanyDashboard = () => {
  const { id } = useParams();
  const [initialLoading, setInitialLoading] = useState(true); // New state for initial loading
  const [companyData, setCompanyData] = useState<any>();


  const fetchData = async () => {
    try {
      if (initialLoading) setInitialLoading(true);
      const response = await axiosInstance.get(`/companies/${id}`);
      setCompanyData(response.data.data);
    } catch (error) {
      console.error("Error fetching company single data:", error);
    } finally {
      setInitialLoading(false); // Disable initial loading after the first fetch
    }
  };



  useEffect(() => {
    
    fetchData();
    
  }, [id]);


  return (

    <Tabs defaultValue="history" className="px-2 mt-1">
      <TabsList>
        <TabsTrigger value="history" className="data-[state=active]:bg-[#A78BFA] data-[state=active]:text-white">Transaction History</TabsTrigger>
        <TabsTrigger value="transaction" className="data-[state=active]:bg-[#A78BFA] data-[state=active]:text-white">Transactions</TabsTrigger>
        <TabsTrigger value="storage" className="data-[state=active]:bg-[#A78BFA] data-[state=active]:text-white">Storage</TabsTrigger>
        <TabsTrigger value="user" className="data-[state=active]:bg-[#A78BFA] data-[state=active]:text-white">Assigned User</TabsTrigger>
      </TabsList>
      <TabsContent value="history">
        <History companyData={companyData} />
      </TabsContent>
      <TabsContent value="transaction">
        <TransactionPage />
      </TabsContent>
      <TabsContent value="storage">
        <StoragePage />
      </TabsContent>
      <TabsContent value="user">
        <CompanyUser />
      </TabsContent>
    </Tabs>


  );
};

export default CompanyDashboard;