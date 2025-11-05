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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment';
import { toast } from '@/components/ui/use-toast';
import { usePermission } from '@/hooks/usePermission';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { CategorySelector } from '../transaction/components/category-selector';
import { time } from 'console';

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

type Method = {
  _id: string;
  name: string;
  companyId: string;
  __v: number;
};

type Storage = {
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

type Category = {
  _id: string;
  name: string;
  type: string;
  parentId: string | null;
  audit: string;
  status: string;
  companyId: string;
  __v: number;
};

type Filters = {
  method: string;
  category: string;
  storage: string;
  type: 'inflow' | 'outflow' | 'all';
};

export default function ReportPage() {
  const { id } = useParams();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [inflowData, setInflowData] = useState<CategorySummary[]>([]);
  const [outflowData, setOutflowData] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [hasFetched, setHasFetched] = useState(false);
  const [companyDetail, setCompanyDetail] = useState('');
  const [isReportGenerated, setIsReportGenerated] = useState(false);
  const { hasPermission, getAuditAccessMethods } = usePermission();
  const auditAccessMethods = getAuditAccessMethods();

  // New state for filters and data
  const [filters, setFilters] = useState<Filters>({
    method: '',
    category: '',
    storage: '',
    type: 'all'
  });
  const [methods, setMethods] = useState<Method[]>([]);
  const [storages, setStorages] = useState<Storage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

  // Get filtered payment methods based on current filter
  const getFilteredPaymentMethods = () => {
    if (filters.method) {
      const selectedMethod = methods.find((m) => m._id === filters.method);
      return selectedMethod ? [selectedMethod.name] : [];
    }
    return paymentMethods;
  };

  // Fetch payment methods, storages, and categories when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [methodsRes, storagesRes, categoriesRes] = await Promise.all([
          axiosInstance.get(`/methods/company/${id}?limit=all`),
          axiosInstance.get(`/storages/company/${id}?limit=all`),
          axiosInstance.get(`/categories/company/${id}?limit=all`)
        ]);

        let methodsData = methodsRes?.data?.data?.result;
        let storagesData = storagesRes?.data?.data?.result;
        let categoriesData = categoriesRes?.data?.data?.result;

        // Filter methods if user is audit
        if (auditAccessMethods) {
          methodsData = methodsData.filter((method: Method) =>
            auditAccessMethods.includes(method._id)
          );
        }

        setMethods(methodsData);
        setStorages(storagesData);
        setCategories(categoriesData);
        setPaymentMethods(methodsData.map((m: Method) => m.name));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    CompanyDetails();
  }, []);

  const CompanyDetails = async () => {
    try {
      const response = await axiosInstance.get(`/users/${id}`);
      const companyData = response?.data?.data;
      setCompanyDetail(companyData);
    } catch (error) {
      console.error('Error fetching company details:', error);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const filteredPaymentMethods = getFilteredPaymentMethods();

    let yPos = 15;

    // Company Header (Left Side)
    doc.setFont('times', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text(companyDetail?.name.toUpperCase(), 15, yPos);

    // Company Details (Right Side)
    const companyDetails = [
      `Address: ${companyDetail?.address}`,
      `Phone: ${companyDetail?.phone}`,
      `Email: ${companyDetail?.email}`
    ];

    doc.setFontSize(10);
    let detailY = 15;
    companyDetails.forEach((text) => {
      doc.text(text, doc.internal.pageSize.width - 80, detailY);
      detailY += 5;
    });

    // Statement Details
    yPos += 20;
    doc.setFont('times', 'normal');
    doc.setFontSize(10);

    // Statement text centered
    const statementText = `STATEMENT OF ACCOUNT FOR THE PERIOD: ${fromDate} to ${toDate}`;
    doc.text(statementText, 15, yPos);

    // Separator Line
    yPos += 8;
    doc.setDrawColor(0, 0, 0);
    doc.line(15, yPos, doc.internal.pageSize.width - 15, yPos);

    // Table Configuration
    const tableConfig = {
      font: 'times',
      theme: 'grid',
      styles: {
        fontSize: 9,
        font: 'times',
        cellPadding: 2,
        lineWidth: 0.2,
        lineColor: [0, 0, 0]
      },
      headStyles: {
        font: 'times',
        fillColor: [255, 255, 255],
        textColor: 0,
        fontStyle: 'bold',
        lineWidth: 0.2,
        lineColor: [0, 0, 0],
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'center' },
        ...Object.fromEntries(
          filteredPaymentMethods.map((_, index) => [
            index + 2,
            { halign: 'right' }
          ])
        ),
        [filteredPaymentMethods.length + 2]: {
          halign: 'right',
          fontStyle: 'bold'
        }
      },
      footStyles: {
        font: 'times',
        fontStyle: 'bold',
        fillColor: [255, 255, 255],
        textColor: 0,
        halign: 'right'
      }
    };

    // Filter data for PDF based on current filters
    const filteredInflowData = filterData(inflowData);
    const filteredOutflowData = filterData(outflowData);

    // Inflow Transactions Table
    if (filteredInflowData.length > 0) {
      yPos += 12;
      doc.setFontSize(12);
      doc.text('INFLOW TRANSACTIONS', 15, yPos);
      yPos += 8;

      const inflowTableData = filteredInflowData.map((category) => [
        category.categoryName,
        category.transactions.length.toString(),
        ...filteredPaymentMethods.map(
          (method) => `£${(category.methodTotals[method] || 0).toFixed(2)}`
        ),
        `£${category.total.toFixed(2)}`
      ]);

      // Add total row
      inflowTableData.push([
        'Total',
        filteredInflowData
          .reduce((acc, cat) => acc + cat.transactions.length, 0)
          .toString(),
        ...filteredPaymentMethods.map(
          (method) =>
            `£${filteredInflowData.reduce((acc, cat) => acc + (cat.methodTotals[method] || 0), 0).toFixed(2)}`
        ),
        `£${filteredInflowData.reduce((acc, cat) => acc + cat.total, 0).toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [
          ['Category', 'Transactions', ...filteredPaymentMethods, 'Total']
        ],
        body: inflowTableData,
        ...tableConfig
      });

      yPos = doc.autoTable.previous.finalY + 15;
    }

    // Outflow Transactions Table
    if (filteredOutflowData.length > 0) {
      if (yPos > 200) {
        doc.addPage();
        yPos = 15;
      }
      doc.setFontSize(12);
      doc.text('OUTFLOW TRANSACTIONS', 15, yPos);
      yPos += 8;

      const outflowTableData = filteredOutflowData.map((category) => [
        category.categoryName,
        category.transactions.length.toString(),
        ...filteredPaymentMethods.map(
          (method) => `£${(category.methodTotals[method] || 0).toFixed(2)}`
        ),
        `£${category.total.toFixed(2)}`
      ]);

      // Add total row
      outflowTableData.push([
        'Total',
        filteredOutflowData
          .reduce((acc, cat) => acc + cat.transactions.length, 0)
          .toString(),
        ...filteredPaymentMethods.map(
          (method) =>
            `£${filteredOutflowData.reduce((acc, cat) => acc + (cat.methodTotals[method] || 0), 0).toFixed(2)}`
        ),
        `£${filteredOutflowData.reduce((acc, cat) => acc + cat.total, 0).toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [
          ['Category', 'Transactions', ...filteredPaymentMethods, 'Total']
        ],
        body: outflowTableData,
        ...tableConfig
      });

      yPos = doc.autoTable.previous.finalY + 15;
    }

    // Footer with Page Numbers and Timestamp
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);

      const pageText = `Page ${i} of ${pageCount}`;
      const timestampText = `Generated on: ${moment().format('YYYY-MM-DD hh:mm:ss A')}`;

      const pageWidth = doc.internal.pageSize.width;
      const footerY = doc.internal.pageSize.height - 10;

      doc.text(pageText, pageWidth / 2 - 10, footerY);
      doc.text(timestampText, 15, footerY);
    }

    doc.save(
      `${companyDetail?.name.toLowerCase()}_statement_${fromDate}_${toDate}.pdf`
    );
  };

const transformData = (
  transactions: Transaction[],
  paymentMethods: string[]
): CategorySummary[] => {
  const categoryMap: { [key: string]: CategorySummary } = {};

  transactions.forEach((transaction) => {
    // Skip if transaction method is not allowed for audit
    if (
      auditAccessMethods &&
      !auditAccessMethods.includes(transaction.transactionMethod._id)
    ) {
      return;
    }

    const categoryName = transaction.transactionCategory?.name;
    const methodName = transaction.transactionMethod?.name;

    if (!categoryMap[categoryName]) {
      categoryMap[categoryName] = {
        categoryName,
        transactions: [],
        methodTotals: Object.fromEntries(
          paymentMethods.map((method) => [method, 0])
        ),
        total: 0,
      };
    }

    categoryMap[categoryName].transactions.push(transaction);

    if (categoryMap[categoryName].methodTotals[methodName] !== undefined) {
      categoryMap[categoryName].methodTotals[methodName] += Number(
        transaction.transactionAmount
      );
    }

    categoryMap[categoryName].total += Number(transaction.transactionAmount);
  });

  return Object.values(categoryMap);
};

const filterData = (data: CategorySummary[]): CategorySummary[] => {
  return data
    .map((category) => {
      const filteredTransactions = category.transactions.filter((transaction) => {
        const methodMatch =
          !filters.method ||
          transaction?.transactionMethod?._id === filters.method;
        const categoryMatch =
          !filters.category ||
          transaction?.transactionCategory?._id === filters.category;
        const storageMatch =
          !filters.storage || transaction?.storage?._id === filters.storage;

        return methodMatch && categoryMatch && storageMatch;
      });

      // Recalculate methodTotals and total based on filtered transactions
      const filteredPaymentMethods = getFilteredPaymentMethods();
      const newMethodTotals: Record<string, number> = Object.fromEntries(
        filteredPaymentMethods.map((method) => [method, 0])
      );

      let newTotal = 0;
      filteredTransactions.forEach((transaction) => {
        const methodName = transaction.transactionMethod?.name;
        if (newMethodTotals[methodName] !== undefined) {
          newMethodTotals[methodName] += Number(transaction.transactionAmount);
        }
        newTotal += Number(transaction.transactionAmount);
      });

      return {
        ...category,
        transactions: filteredTransactions,
        methodTotals: newMethodTotals,
        total: newTotal,
      };
    })
    .filter((category) => category.transactions.length > 0);
};

  const fetchData = async () => {
    if (!fromDate || !toDate) {
      toast({
        title: 'Please select both "From Date" and "To Date".',
        className: 'bg-destructive text-white border-none'
      });
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      toast({
        title: '"From Date" cannot be later than "To Date".',
        className: 'bg-destructive text-white border-none'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.get(`/report/company/${id}`, {
        params: {
          startDate: fromDate,
          endDate: toDate
        },
        timeout: 120000,
        maxContentLength: Infinity,
  maxBodyLength: Infinity
      });

      const transactions = response.data.data;
      setAllTransactions(transactions);

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
      setIsReportGenerated(true);
    }catch (error: any) {
  console.error('Error fetching data:', error);

  let backendMessage = 'Failed to fetch data. Please try again later.';

  // If response exists, use its message
  if (error.response && error.response.data) {
    if (error.response.data.message) {
      backendMessage = error.response.data.message;
    } else if (typeof error.response.data === 'string') {
      backendMessage = error.response.data;
    }
  }

  toast({
    title: backendMessage,
    className: 'bg-destructive text-white border-none'
  });

  // Optionally log full data for debugging
  if (error.response?.data?.data) {
    console.log('Received data anyway:', error.response.data.data);
    setAllTransactions(error.response.data.data); // force set if needed
  }
}
finally {
      setLoading(false);
    }
  };

  const renderTransactionTable = (
    type: 'inflow' | 'outflow',
    data: CategorySummary[]
  ) => {
    // Apply filters to the data
    const filteredData = filterData(data);
    const filteredPaymentMethods = getFilteredPaymentMethods();

    if (filteredData.length === 0) return null;

    return (
     <Card className="p-2">
  <CardHeader>
    <CardTitle className="p-4 text-xl font-bold capitalize">{type} Transactions</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-theme/80 bg-theme text-white">
            <TableHead className="w-[250px]">Category Name</TableHead>
            <TableHead className="w-[150px] text-right">Transaction Count</TableHead>
            {filteredPaymentMethods.map((method) => (
              <TableHead key={method} className="text-right">{method}</TableHead>
            ))}
            <TableHead className="w-[150px] text-right">Sub Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((category) => (
            <>
              <TableRow
                key={category.categoryName}
                className="hover:cursor-pointer"
                onClick={() =>
                  setExpandedCategory(
                    expandedCategory === category.categoryName ? null : category.categoryName
                  )
                }
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {expandedCategory === category.categoryName ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {category.categoryName}
                  </div>
                </TableCell>
                <TableCell className="text-right">{category.transactions.length}</TableCell>
                {filteredPaymentMethods.map((method) => (
                  <TableCell key={method} className="text-right">
                    £{Number(category.methodTotals[method] || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                ))}
                <TableCell className="text-right font-bold">
                  £{Number(category.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
              </TableRow>

              {expandedCategory === category.categoryName && (
                <TableRow>
                  <TableCell colSpan={filteredPaymentMethods.length + 3}>
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-theme/80 bg-theme text-white">
                          <TableHead className="w-[200px] text-right">Date</TableHead>
                          <TableHead className="w-[150px] text-right">Transaction ID</TableHead>
                          <TableHead className="w-[150px] text-right">Invoice No</TableHead>
                          <TableHead className="w-[150px] text-right">Details</TableHead>
                          <TableHead className="w-[150px] text-right">Transaction Method</TableHead>
                          <TableHead className="w-[150px] text-right">Storage</TableHead>
                          <TableHead className="w-[150px] text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {category.transactions
                          .sort((a, b) => a.transactionMethod.name.localeCompare(b.transactionMethod.name))
                          .map((transaction) => (
                            <TableRow key={transaction._id} className="bg-gray-200">
                              <TableCell className="text-right">{moment(transaction?.transactionDate).format('DD MMM YYYY')}</TableCell>
                              <TableCell className="text-right">{transaction?.tcid}</TableCell>
                              <TableCell className="text-right">{transaction?.invoiceNumber}</TableCell>
                              <TableCell className="text-right">{transaction?.details}</TableCell>
                              <TableCell className="text-right">{transaction?.transactionMethod?.name}</TableCell>
                              <TableCell className="text-right">{transaction.storage?.storageName}</TableCell>
                              <TableCell className="text-right">
                                £{Number(transaction.transactionAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
          <TableRow className="font-bold">
            <TableCell>Total</TableCell>
            <TableCell className="text-right">{filteredData.reduce((acc, cat) => acc + cat.transactions.length, 0)}</TableCell>
            {filteredPaymentMethods.map((method) => (
              <TableCell key={method} className="text-right">
                £{filteredData.reduce((acc, cat) => acc + Number(cat.methodTotals[method] || 0), 0)
                  .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
            ))}
            <TableCell className="text-right">
              £{filteredData.reduce((acc, cat) => acc + Number(cat.total), 0)
                .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </CardContent>
</Card>


    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md bg-white p-4 shadow-md">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between">
            <h1 className="text-3xl font-bold">Transaction Report</h1>
          </div>

          <div className="flex flex-col gap-4 p-4">
            <div className="flex flex-wrap  gap-4">
              <div className="flex min-w-[200px] items-center gap-2">
                <label className="whitespace-nowrap text-sm font-medium">
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-9 w-full rounded-md border border-gray-300 px-2 py-[2px]"
                />
              </div>

              <div className="flex min-w-[200px] items-center gap-2">
                <label className="whitespace-nowrap text-sm font-medium">
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-9 w-full rounded-md border border-gray-300 px-2 py-[2px]"
                />
              </div>

              <div className="w-full min-w-[200px] sm:w-auto">
                <CategorySelector
                  categories={categories}
                  onSelect={(categoryId) =>
                    setFilters({ ...filters, category: categoryId })
                  }
                  onTypeChange={(type) => setFilters({ ...filters, type })}
                  defaultType={filters.type}
                />
              </div>

              <div className="min-w-[200px]">
                <Select
                  value={filters.method}
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      method: value === 'all' ? '' : value
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    {methods.map((method) => (
                      <SelectItem key={method._id} value={method._id}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Storage Filter */}
              <div className="min-w-[200px]">
                <Select
                  value={filters.storage}
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      storage: value === 'all' ? '' : value
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by Storage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Storages</SelectItem>
                    {storages.map((storage) => (
                      <SelectItem key={storage._id} value={storage._id}>
                        {storage.storageName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({
                      method: '',
                      category: '',
                      storage: '',
                      type: 'all'
                    });
                    setFromDate('');
                    setToDate('');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
              <div className="flex justify-end gap-4">
                <Button variant="theme" onClick={fetchData}>
                  Generate Report
                </Button>
                {isReportGenerated && (
                  <Button variant="theme" onClick={generatePDF}>
                    Download PDF Report
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className=" w-full space-y-6">
            {loading ? (
              <div className="flex h-40 w-full flex-col items-center justify-center">
                <div className="flex flex-row items-center gap-4">
                  <p className="font-semibold">Please Wait..</p>
                  <div className="h-5 w-5 animate-spin rounded-full border-4 border-dashed border-theme"></div>
                </div>
              </div>
            ) : (
              <>
                {filters.type !== 'outflow' &&
                  renderTransactionTable('inflow', inflowData)}
                {filters.type !== 'inflow' &&
                  renderTransactionTable('outflow', outflowData)}
                {hasFetched &&
                  inflowData.length === 0 &&
                  outflowData.length === 0 && (
                    <p>No data available for the selected date range.</p>
                  )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
