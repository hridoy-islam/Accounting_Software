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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment';

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
  const [companyDetail, setCompanyDetail] = useState('');
  const [isReportGenerated, setIsReportGenerated] = useState(false);

 const [companyThemeColor, setCompanyThemeColor] = useState<string>('');

  // useEffect(() => {
  //     const fetchCompanyData = async () => {
  
  //       try {
  //         const response = await axiosInstance.get(`/users/${id}`);
  //         setCompanyThemeColor(response.data.data.themeColor); // Fetch and set the company theme color
          
  //       } catch (error) {
  //         console.error('Error fetching company data:', error);
  //       }
  //     };
  //     fetchCompanyData();
  //   }, [id]);
  
  //   useEffect(() => {
  //     const themeColor = companyThemeColor || '#a78bfa'; // Default color (adjust as needed)
  //     document.documentElement.style.setProperty('--theme', themeColor);
  //   }, [companyThemeColor]);
    
  

    const generatePDF = () => {
      const doc = new jsPDF();
    
      let yPos = 15; // Reduced margin from top
    
      // Company Header (Left Side)
      doc.setFont('times', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 0);
      doc.text(companyDetail?.name.toUpperCase(), 15, yPos);
    
      // Company Details (Right Side)
      const companyDetails = [
        `Address: ${companyDetail?.address}`,
        `Phone: ${companyDetail?.phone}`,
        `Email: ${companyDetail?.email}`,
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
    
      // Table Configuration (Improved alignment)
      const tableConfig = {
        font: 'times',
        theme: 'grid',
        styles: {
          fontSize: 9,
          font: 'times',
          cellPadding: 2,
          lineWidth: 0.2,
          lineColor: [0, 0, 0],
        },
        headStyles: {
          font: 'times',
          fillColor: [255, 255, 255],
          textColor: 0,
          fontStyle: 'bold',
          lineWidth: 0.2,
          lineColor: [0, 0, 0],
          halign: 'center', // Center align header text
        },
        columnStyles: {
          0: { halign: 'left' },
          1: { halign: 'center' },
          ...Object.fromEntries(
            paymentMethods.map((_, index) => [index + 2, { halign: 'right' }])
          ),
          [paymentMethods.length + 2]: { halign: 'right', fontStyle: 'bold' },
        },
        footStyles: {
          font: 'times',
          fontStyle: 'bold',
          fillColor: [255, 255, 255],
          textColor: 0,
          halign: 'right',
        },
      };
    
      // Inflow Transactions Table
      if (inflowData.length > 0) {
        yPos += 12;
        doc.setFontSize(12);
        doc.text('INFLOW TRANSACTIONS', 15, yPos);
        yPos += 8;
    
        const inflowTableData = inflowData.map((category) => [
          category.categoryName,
          category.transactions.length.toString(),
          ...paymentMethods.map(
            (method) => `£${(category.methodTotals[method] || 0).toFixed(2)}`
          ),
          `£${category.total.toFixed(2)}`,
        ]);
    
        // Add total row
        inflowTableData.push([
          'Total',
          inflowData.reduce((acc, cat) => acc + cat.transactions.length, 0).toString(),
          ...paymentMethods.map(
            (method) =>
              `£${inflowData.reduce((acc, cat) => acc + (cat.methodTotals[method] || 0), 0).toFixed(2)}`
          ),
          `£${inflowData.reduce((acc, cat) => acc + cat.total, 0).toFixed(2)}`,
        ]);
    
        autoTable(doc, {
          startY: yPos,
          head: [['Category', 'Transactions', ...paymentMethods, 'Total']],
          body: inflowTableData,
          ...tableConfig,
        });
    
        yPos = doc.autoTable.previous.finalY + 15;
      }
    
      // Outflow Transactions Table
      if (outflowData.length > 0) {
        if (yPos > 200) {
          doc.addPage();
          yPos = 15;
        }
        doc.setFontSize(12);
        doc.text('OUTFLOW TRANSACTIONS', 15, yPos);
        yPos += 8;
    
        const outflowTableData = outflowData.map((category) => [
          category.categoryName,
          category.transactions.length.toString(),
          ...paymentMethods.map(
            (method) => `£${(category.methodTotals[method] || 0).toFixed(2)}`
          ),
          `£${category.total.toFixed(2)}`,
        ]);
    
        // Add total row
        outflowTableData.push([
          'Total',
          outflowData.reduce((acc, cat) => acc + cat.transactions.length, 0).toString(),
          ...paymentMethods.map(
            (method) =>
              `£${outflowData.reduce((acc, cat) => acc + (cat.methodTotals[method] || 0), 0).toFixed(2)}`
          ),
          `£${outflowData.reduce((acc, cat) => acc + cat.total, 0).toFixed(2)}`,
        ]);
    
        autoTable(doc, {
          startY: yPos,
          head: [['Category', 'Transactions', ...paymentMethods, 'Total']],
          body: outflowTableData,
          ...tableConfig,
        });
    
        yPos = doc.autoTable.previous.finalY + 15;
      }
    
      // Footer with Page Numbers and Timestamp (Centered)
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
    
      // Save the PDF
      doc.save(`${companyDetail?.name.toLowerCase()}_statement_${fromDate}_${toDate}.pdf`);
    };
    

  // Fetch payment methods when the component mounts
  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await axiosInstance.get(
        `/methods/company/${id}?limit=all`
      );
      const methods = response.data.data.result.map(
        (method: { name: string }) => method.name
      );
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const CompanyDetails = async () => {
    try {
      const response = await axiosInstance.get(`/users/${id}`);
      const companyData = response.data.data;
      setCompanyDetail(companyData); // Assuming the company name is in 'data.name'
    } catch (error) {
      console.error('Error fetching company details:', error);
    }
  };

  useEffect(() => {
    CompanyDetails();
  }, []);

  const transformData = (
    transactions: Transaction[],
    paymentMethods: string[]
  ) => {
    const categoryMap: { [key: string]: CategorySummary } = {};

    transactions.forEach((transaction) => {
      const categoryName = transaction.transactionCategory.name;
      const methodName = transaction.transactionMethod.name;

      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = {
          categoryName,
          transactions: [],
          methodTotals: Object.fromEntries(
            paymentMethods.map((method) => [method, 0])
          ),
          total: 0
        };
      }

      categoryMap[categoryName].transactions.push(transaction);

      if (categoryMap[categoryName].methodTotals[methodName] !== undefined) {
        categoryMap[categoryName].methodTotals[methodName] +=
          transaction.transactionAmount;
      }

      categoryMap[categoryName].total += transaction.transactionAmount;
    });

    return Object.values(categoryMap);
  };

  const fetchData = async () => {
    if (!fromDate || !toDate) {
      alert('Please select both "From Date" and "To Date".');
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      alert('"From Date" cannot be later than "To Date".');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.get(`/report/company/${id}`, {
        params: {
          startDate: fromDate,
          endDate: toDate
        }
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
      setIsReportGenerated(true);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('An error occurred while fetching data. Please try again.');
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
        <div className="border">
          <Table>
            <TableHeader>
              <TableRow className="bg-theme text-white hover:bg-theme/80 ">
                <TableHead className="w-[250px] ">Category Name</TableHead>
                <TableHead className="w-[150px] text-right">
                  Transaction Count
                </TableHead>
                {paymentMethods.map((method) => (
                  <TableHead key={method} className="text-right">
                    {method}
                  </TableHead>
                ))}
                <TableHead className="w-[150px] text-right">
                  Sub Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((category) => (
                <>
                  <TableRow
                    key={category.categoryName}
                    className="hover:cursor-pointer"
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
                        £
                        {category.methodTotals[method]
                          .toFixed(2)
                          .toLocaleString()}
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-bold">
                      £{category.total.toFixed(2).toLocaleString()}
                    </TableCell>
                  </TableRow>

                  {/* Sort transactions by transactionMethod name */}
                  {expandedCategory === category.categoryName && (
                    <TableRow>
                      <TableCell colSpan={paymentMethods.length + 3}>
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-theme text-white hover:bg-theme/80">
                              <TableHead className="w-[200px] text-right">
                                Date
                              </TableHead>
                              <TableHead className="w-[150px] text-right">
                                Transaction ID
                              </TableHead>
                              <TableHead className="w-[150px] text-right">
                                Invoice No
                              </TableHead>
                              <TableHead className="w-[150px] text-right">
                                Details
                              </TableHead>
                              <TableHead className="w-[150px] text-right">
                                Transaction Method
                              </TableHead>
                              <TableHead className="w-[150px] text-right">
                                Amount
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {category.transactions
                              .sort((a, b) => {
                                if (
                                  a.transactionMethod.name <
                                  b.transactionMethod.name
                                ) {
                                  return -1;
                                }
                                if (
                                  a.transactionMethod.name >
                                  b.transactionMethod.name
                                ) {
                                  return 1;
                                }
                                return 0;
                              })
                              .map((transaction) => (
                                <TableRow
                                  key={transaction._id}
                                  className="bg-gray-200"
                                >
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
                                    {transaction.transactionAmount
                                      .toFixed(2)
                                      .toLocaleString()}
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
                <TableCell className="text-right">
                  {data.reduce((acc, cat) => acc + cat.transactions.length, 0)}
                </TableCell>
                {paymentMethods.map((method) => (
                  <TableCell key={method} className="text-right">
                    £
                    {data
                      .reduce((acc, cat) => acc + cat.methodTotals[method], 0)
                      .toFixed(2)
                      .toLocaleString()}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  £
                  {data
                    .reduce((acc, cat) => acc + cat.total, 0)
                    .toFixed(2)
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
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-start sm:gap-16">
            <div className="flex flex-col sm:flex-row sm:gap-8">
              <div className="flex flex-row  items-center justify-center gap-2">
                <label className="text-sm font-medium">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-[250px] rounded-md border border-gray-300 px-2 py-[4px]"
                />
              </div>

              <div className="flex flex-row items-center justify-center gap-2">
                <label className="text-sm font-medium">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-[250px] rounded-md border border-gray-300 px-2 py-[4px]"
                />
              </div>
            </div>
            <Button variant="theme" className="mt-4" onClick={fetchData}>
              Generate Report
            </Button>

            {isReportGenerated && (
              <Button variant="theme" className=" mt-4" onClick={generatePDF}>
                Download PDF Report
              </Button>
            )}
          </div>
        </div>

        <div className="mt-8 w-full space-y-6">
          {loading ? (
            <div className="flex h-40 w-full flex-col items-center justify-center">
              <div className="flex flex-row items-center gap-4">
                <p className="font-semibold">Please Wait..</p>
                <div className="h-5 w-5 animate-spin rounded-full border-4 border-dashed border-theme"></div>
              </div>
            </div>
          ) : (
            <>
              {inflowData.length > 0 &&
                renderTransactionTable('inflow', inflowData)}
              {outflowData.length > 0 &&
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
  );
}
