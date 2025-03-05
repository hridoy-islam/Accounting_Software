import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useEffect, useState } from 'react';
import {  useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';

import {  Landmark } from 'lucide-react';

export default function TransactionHistory() {
  const { id } = useParams();
  const [storages, setStorages] = useState<any>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [transactions, setTransactions] = useState<any>([]);
  const [monthlyData, setMonthlyData] = useState<any>([]);
  const [companyData, setCompanyData] = useState<any>();

  const fetchData = async () => {
    try {
      if (initialLoading) setInitialLoading(true);
      const response = await axiosInstance.get(`/storages?companyId=${id}`);
      setStorages(response.data.data.result);
      // Fetch transactions with dynamic companyID
      const transactionsResponse = await axiosInstance.get(
        `/transactions?companyId=${id}&limit=all`
      );

      setTransactions(transactionsResponse.data.data.result);
      aggregateMonthlyData(transactionsResponse.data.data.result);

      const company = await axiosInstance.get(`/users/${id}`);
      setCompanyData(company.data.data);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    } finally {
      setInitialLoading(false); // Disable initial loading after the first fetch
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const totalOpeningBalance = storages.reduce(
    (sum, Item) => sum + Number(Item.openingBalance),
    0
  );

  const aggregateMonthlyData = (transactions) => {
    const data = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.transactionDate);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })}-${date.getFullYear()}`;

      if (!data[monthYear]) {
        data[monthYear] = { inflow: 0, outflow: 0 };
      }
      if (transaction.transactionType === 'inflow') {
        data[monthYear].inflow += transaction.transactionAmount;
      } else if (transaction.transactionType === 'outflow') {
        data[monthYear].outflow += transaction.transactionAmount;
      }
    });

    // Convert to array and sort by date
    const sortedData = Object.entries(data)
      .sort((a, b) => new Date(`01-${a[0]}`) - new Date(`01-${b[0]}`))
      .map(([monthYear, values]) => ({
        monthYear,
        ...values
      }));

    setMonthlyData(sortedData);
  };

 

  return (
    <div className="  flex flex-col gap-4">
     

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Table Section */}
        <div className="relative rounded-lg bg-white p-6 shadow-md lg:col-span-2">
          {/* Header with flex container for alignment */}
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">
              {companyData?.name} <br />{' '}
              <span className="text-lg font-semibold">Recent Transactions</span>
            </h1>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">Month</TableHead>
                <TableHead className="font-bold">Inflow</TableHead>
                <TableHead className="font-bold">Outflow</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyData.map((data, index) => (
                <TableRow key={index}>
                  <TableCell className="font-bold">{data.monthYear}</TableCell>
                  <TableCell className="font-bold">
                    £{data.inflow.toFixed(2)}
                  </TableCell>
                  <TableCell className="font-bold">
                    £{data.outflow.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-xl font-semibold">Balance</h2>
            <p className="text-2xl font-bold">
              £
              {totalOpeningBalance.toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Storage</h2>
            {storages.map((Item, index) => (
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
                  £{(Item.openingBalance.toFixed(2))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
