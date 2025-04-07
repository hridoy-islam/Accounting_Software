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
  const [transactions, setTransactions] = useState<any>([]);
  const [monthlyData, setMonthlyData] = useState<any>([]);
  const [companyData, setCompanyData] = useState<any>();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false); // Loading state for year changes

  // Generate years from 2000 to 2050
  const years = Array.from({ length: 51 }, (_, i) => 2000 + i);

  const fetchData = async () => {
    try {
      if (initialLoading) setInitialLoading(true);
      setLoading(true);

      const response = await axiosInstance.get(`/storages?companyId=${id}`);
      setStorages(response.data.data.result);

      const transactionsResponse = await axiosInstance.get(
        `/transactions?companyId=${id}&limit=all`
      );
      setTransactions(transactionsResponse.data.data.result);
      filterDataByYear(transactionsResponse.data.data.result, selectedYear);

      const company = await axiosInstance.get(`/users/${id}`);
      setCompanyData(company.data.data);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    } finally {
      setInitialLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter data when year changes
  useEffect(() => {
    if (transactions.length > 0) {
      setLoading(true);
      filterDataByYear(transactions, selectedYear);
      setTimeout(() => setLoading(false), 500); // Small delay to show loading
    }
  }, [selectedYear]);

  const filterDataByYear = (transactions, year) => {
    const filtered = transactions.filter((transaction) => {
      const date = new Date(transaction.transactionDate);
      return date.getFullYear() === year;
    });
    aggregateMonthlyData(filtered);
  };

  const aggregateMonthlyData = (transactions) => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];

    // Initialize all months with 0 values
    const monthlySummary = months.map((month) => ({
      monthYear: `${month}-${selectedYear}`,
      month,
      year: selectedYear,
      inflow: 0,
      outflow: 0
    }));

    transactions.forEach((transaction) => {
      const date = new Date(transaction.transactionDate);
      const month = date.toLocaleString('default', { month: 'short' });
      const monthIndex = months.indexOf(month);

      if (monthIndex !== -1) {
        if (transaction.transactionType === 'inflow') {
          monthlySummary[monthIndex].inflow += transaction.transactionAmount;
        } else if (transaction.transactionType === 'outflow') {
          monthlySummary[monthIndex].outflow += transaction.transactionAmount;
        }
      }
    });

    setMonthlyData(monthlySummary);
  };

  const totalOpeningBalance = storages.reduce(
    (sum, Item) => sum + Number(Item.openingBalance),
    0
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="relative rounded-lg bg-white p-6 shadow-md lg:col-span-2">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Recent Transactions</h1>
            <div className="flex items-center gap-2">
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
                disabled={initialLoading}
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

          {loading || initialLoading ? (
            <div className="space-y-4">
              <div className="flex h-10 w-full flex-col items-center justify-center">
                <div className="flex flex-row items-center gap-4">
                  <p className="font-semibold">Please Wait..</p>
                  <div className="h-5 w-5 animate-spin rounded-full border-4 border-dashed border-theme"></div>
                </div>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">Month</TableHead>
                  <TableHead className="font-bold ">Inflow</TableHead>
                  <TableHead className="font-bold ">Outflow</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyData.map((data, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-bold">
                      {data.monthYear}
                    </TableCell>
                    <TableCell className="font-bold ">
                      £{data.inflow.toFixed(2)}
                    </TableCell>
                    <TableCell className="font-bold ">
                      £{data.outflow.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex justify-between rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-xl font-semibold">Balance</h2>

            <p className="text-2xl font-bold">
              £{totalOpeningBalance.toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Storage</h2>
            {
              storages.map((Item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2"
                >
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
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
