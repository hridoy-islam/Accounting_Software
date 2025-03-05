'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; 
import { ChevronDown, ChevronUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axiosInstance from '@/lib/axios';

type Transaction = {
  _id: string;
  tcid: string;
  transactionType: 'inflow' | 'outflow';
  transactionDate: string;
  invoiceNumber: string;
  invoiceDate: string;
  details: string;
  description: string;
  transactionAmount: number;
  transactionDoc: string;
  transactionCategory: {
    _id: string;
    name: string;
    type: string;
    parentId: string | null;
    audit: string;
    status: string;
    companyId: string;
    __v: number;
  };
  transactionMethod: {
    _id: string;
    name: string;
    companyId: string;
    __v: number;
  };
  storage: {
    _id: string;
    storageName: string;
    openingBalance: number;
    openingDate: string;
    logo: string | null;
    status: boolean;
    auditStatus: boolean;
    companyId: string;
    __v: number;
  };
  companyId: string;
  createdAt: string;
  updatedAt: string;
};
type CategorySummary = {
  categoryName: string;
  transactions: Transaction[];
  methodTotals: { [key: string]: number };
  total: number;
};

export default function ReportPage() {
  const { id } = useParams(); // Get the company ID from the URL
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [inflowData, setInflowData] = useState<CategorySummary[]>([]);
  const [outflowData, setOutflowData] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [hasFetched, setHasFetched] = useState(false); // Track fetch attempt

  // Fetch payment methods when the component mounts
  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await axiosInstance.get(`/methods/company/${id}?limit=all`);
      const methods = response.data.data.result.map((method: { name: string }) => method.name);
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  // Fetch transaction data when the date range changes
  // useEffect(() => {
  //   if (fromDate && toDate) {
  //     fetchData();
  //   }
  // }, [fromDate, toDate]);

  const transformData = (transactions: Transaction[], paymentMethods: string[]) => {
    const categoryMap: { [key: string]: CategorySummary } = {};

    transactions.forEach((transaction) => {
      const categoryName = transaction.transactionCategory.name;
      const methodName = transaction.transactionMethod.name;

      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = {
          categoryName,
          transactions: [],
          methodTotals: Object.fromEntries(paymentMethods.map((method) => [method, 0])),
          total: 0,
        };
      }

      categoryMap[categoryName].transactions.push(transaction);

      if (categoryMap[categoryName].methodTotals[methodName] !== undefined) {
        categoryMap[categoryName].methodTotals[methodName] += transaction.transactionAmount;
      }

      categoryMap[categoryName].total += transaction.transactionAmount;
    });

    return Object.values(categoryMap);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/report/company/${id}`, {
        params: {
          startDate: fromDate,
          endDate: toDate,
        },
      });

      const transactions = response.data.data.result;

      const inflowTransactions = transactions.filter(
        (t: Transaction) => t.transactionType === 'inflow'
      );
      const outflowTransactions = transactions.filter(
        (t: Transaction) => t.transactionType === 'outflow'
      );

      const inflowData = transformData(inflowTransactions, paymentMethods);
      const outflowData = transformData(outflowTransactions, paymentMethods);

      setInflowData(inflowData);
      setOutflowData(outflowData);
      setHasFetched(true);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      
    }
  };
  const renderTransactionTable = (
    type: 'inflow' | 'outflow',
    data: CategorySummary[]
  ) => (
    <Card className="p-2">
      <CardHeader>
        <CardTitle className="p-4 text-xl font-bold capitalize">
          {type} Transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className=" border">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#a78bfa] text-white hover:bg-[#a78bfa]/80 ">
                <TableHead className="w-[250px] ">Category Name</TableHead>
                <TableHead className="w-[150px]  text-right">
                  Transaction Count
                </TableHead>
                {paymentMethods.map((method) => (
                  <TableHead key={method} className="   text-right">
                    {method}
                  </TableHead>
                ))}
                <TableHead className="w-[150px]   text-right">Sub Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((category) => (
                <>
                  <TableRow
                    key={category.categoryName}
                    className="hover: cursor-pointer "
                    onClick={() =>
                      setExpandedCategory(
                        expandedCategory === category.categoryName
                          ? null
                          : category.categoryName
                      )
                    }
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {expandedCategory === category.categoryName ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        {category.categoryName}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {category.transactions.length}
                    </TableCell>
                    {paymentMethods.map((method) => (
                      <TableCell key={method} className="text-right">
                        £{category.methodTotals[method].toFixed(2).toLocaleString()}
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-bold">
                    £{category.total.toFixed(2).toLocaleString()}
                    </TableCell>
                  </TableRow>
                  {expandedCategory === category.categoryName && (
                    <TableRow>
                      <TableCell colSpan={paymentMethods.length + 3}>
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-[#a78bfa] text-white hover:bg-[#a78bfa]/80">
                              <TableHead className="w-[200px]   text-right">
                                Date
                              </TableHead>
                              <TableHead className="w-[150px]   text-right">
                                Transaction ID
                              </TableHead>
                              <TableHead className="w-[150px]   text-right">
                                Invoice No
                              </TableHead>
                              <TableHead className="w-[150px]   text-right">
                                Details
                              </TableHead>
                              <TableHead className="w-[150px]   text-right">
                                Transaction Method
                              </TableHead>
                              <TableHead className="w-[150px]   text-right">
                                Amount
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {category.transactions.map((transaction) => (
                              <TableRow key={transaction._id} className='bg-gray-200'>
                                <TableCell className="text-right">
                                  {new Date(
                                    transaction.transactionDate
                                  ).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                  {transaction.tcid}
                                </TableCell>
                                <TableCell className="text-right">
                                  {transaction.invoiceNumber}
                                </TableCell>
                                <TableCell className="text-right">
                                  {transaction.details}
                                </TableCell>
                                <TableCell className="text-right">
                                  {transaction.transactionMethod.name}
                                </TableCell>
                                <TableCell className="text-right">
                                £
                                  {transaction.transactionAmount.toFixed(2).toLocaleString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
              <TableRow className="  font-bold">
                <TableCell>Total</TableCell>
                <TableCell className="text-right">
                  {data.reduce((acc, cat) => acc + cat.transactions.length, 0)}
                </TableCell>
                {paymentMethods.map((method) => (
                  <TableCell key={method} className="text-right">
                    £
                    {data
                      .reduce((acc, cat) => acc + cat.methodTotals[method], 0).toFixed(2)
                      .toLocaleString()}  
                  </TableCell>
                ))}
                <TableCell className="text-right">
                £
                  {data
                    .reduce((acc, cat) => acc + cat.total, 0).toFixed(2)
                    .toLocaleString()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col gap-4">
    
  
    <div className="rounded-md bg-white p-4 shadow-md">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold">Transaction Report</h1>
        </div>
        <div className="flex flex-col sm:gap-16 sm:flex-row sm:items-end sm:justify-start">
          <div className="flex flex-col sm:gap-8 sm:flex-row">
            <div className="flex flex-row  items-center justify-center gap-2">
              <label className="text-sm font-medium">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-[250px] py-[4px] px-2 border rounded-md border-gray-300"
              />
            </div>
  
            <div className="flex flex-row items-center justify-center gap-2">
              <label className="text-sm font-medium">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-[250px] py-[4px] px-2 border rounded-md border-gray-300"
              />
            </div>
          </div>
          <Button className="mt-4 btn-theme" onClick={fetchData}>
            Generate Report
          </Button>
        </div>
      </div>
  
      <div className="mt-8 w-full space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center w-full h-40">
          <div className="flex flex-row items-center gap-4">
            <p className="font-semibold">Please Wait..</p>
            <div className="w-5 h-5 border-4 border-dashed rounded-full animate-spin border-[#a78bfa]"></div>
          </div>
        </div>
        ) : (
          <>
            {inflowData.length > 0 && renderTransactionTable('inflow', inflowData)}
            {outflowData.length > 0 && renderTransactionTable('outflow', outflowData)}
            {hasFetched && inflowData.length === 0 && outflowData.length === 0 && (
          <p>No data available for the selected date range.</p>
        )}
          </>
        )}
      </div>
    </div>
  </div>
  );
}