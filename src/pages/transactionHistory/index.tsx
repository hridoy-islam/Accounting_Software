import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { Landmark } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export default function TransactionHistory() {
  const { id } = useParams();
  const [storages, setStorages] = useState<any>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<any>([]);
  const [companyData, setCompanyData] = useState<any>();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  // Generate years from 2000 to current year + 10
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2000 + 11 }, (_, i) => 2000 + i);

  const fetchData = async (year: number) => {
    try {
      setLoading(true);
      
      // Fetch storages and company data (only once)
      if (initialLoading) {
        const response = await axiosInstance.get(`/storages?companyId=${id}`);
        setStorages(response.data.data.result);
        
        const company = await axiosInstance.get(`/users/${id}`);
        setCompanyData(company.data.data);
      }

      // Fetch transactions for the selected year
      const transactionsResponse = await axiosInstance.get(
        `/transactions/company-transaction/${id}?year=${year}`
      );
      
      // Process the monthly data from the response
      processMonthlyData(transactionsResponse.data.data);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setInitialLoading(false);
      setLoading(false);
    }
  };

  const processMonthlyData = (data: any[]) => {
    // Create an array for all 12 months initialized with 0 values
    const monthsData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthName: new Date(selectedYear, i).toLocaleString('default', { month: 'short' }),
      totalInflow: 0,
      totalOutflow: 0
    }));

    // Fill in the data from the API response
    data.forEach(item => {
      const monthIndex = item.month - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        monthsData[monthIndex] = {
          ...monthsData[monthIndex],
          totalInflow: item.totalInflow,
          totalOutflow: item.totalOutflow
        };
      }
    });

    setMonthlyData(monthsData);
  };

  useEffect(() => {
    fetchData(selectedYear);
  }, [selectedYear]);

  const totalOpeningBalance = storages.reduce(
    (sum, Item) => sum + Number(Item.openingBalance),
    0
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="relative rounded-lg bg-white p-6 shadow-md lg:col-span-2">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Transaction Summary</h1>
            <div className="flex items-center gap-2">
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
                disabled={loading}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="flex flex-row items-center gap-4">
                <p className="font-semibold">Loading data...</p>
                <div className="h-5 w-5 animate-spin rounded-full border-4 border-dashed border-theme"></div>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">Month</TableHead>
                  <TableHead className="font-bold text-right">Inflow</TableHead>
                  <TableHead className="font-bold text-right">Outflow</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyData.map((data, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {data.monthName} {selectedYear}
                    </TableCell>
                    <TableCell className="text-right">
                      £{data.totalInflow.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      £{data.totalOutflow.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex justify-between rounded-lg bg-white p-6 shadow-md">
            <h2 className="text-xl font-semibold">Balance</h2>
            <p className="text-2xl font-bold">
              £{totalOpeningBalance.toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Storage</h2>
            {storages.map((Item, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center font-bold">
                    <Landmark className="h-5 w-5" />
                  </div>
                  <span className="font-medium">{Item.storageName}</span>
                </div>
                <span className="font-bold">
                  £{Item.openingBalance.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}