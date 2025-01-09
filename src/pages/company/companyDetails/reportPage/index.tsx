import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import DatePicker from 'react-datepicker';
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet
} from '@react-pdf/renderer';
import CompanyNav from '../../components/companyNav';
import { DatePickerRange } from '@/components/ui/DatePickerRange';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const ReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [filterType, setFilterType] = useState<'daily' | 'monthly' | 'yearly' | 'custom'>('monthly');
  const [startDate, setStartDate] = useState<Date>(() => new Date());
  const [endDate, setEndDate] = useState<Date>(() => new Date());
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [showDateRange, setShowDateRange] = useState(false);

  const handleFilterChange = (value: string) => {
    setFilterType(value as 'daily' | 'monthly' | 'yearly' | 'custom');
    if (value === 'custom') {
      setShowDateRange(true);
    } else {
      setShowDateRange(false);
      // Set date range based on filter type
      const now = new Date();
      let start = new Date();
      let end = new Date();

      switch (value) {
        case 'daily':
          start.setDate(now.getDate() - 7); // Last 7 days
          break;
        case 'monthly':
          start.setMonth(now.getMonth() - 1); // Last month
          break;
        case 'yearly':
          start.setFullYear(now.getFullYear() - 1); // Last year
          break;
      }
      
      setStartDate(start);
      setEndDate(end);
      generateReport(start, end, value as 'daily' | 'monthly' | 'yearly');
    }
  };

  const handleDateRangeChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    if (start && end) {
      setStartDate(start);
      setEndDate(end);
      generateReport(start, end, filterType);
    }
  };

  const generateReport = async (
    start: Date,
    end: Date,
    type: 'daily' | 'monthly' | 'yearly' | 'custom'
  ) => {
    // Add API call to generate report based on type and date range
    console.log('Generating report:', { start, end, type });
    
    // Mock data based on filter type
    const mockData: ReportData[] = [
      {
        period: start.toISOString().slice(0, 10),
        totalInflow: 10000,
        totalOutflow: 8000,
        categories: {
          Salary: { inflow: 9000, outflow: 0 },
          Marketing: { inflow: 0, outflow: 2000 },
          'Office Supplies': { inflow: 0, outflow: 500 }
        }
      }
    ];
    setReportData(mockData);
  };

  return (
    <div className="container flex flex-col justify-center p-6">
      <CompanyNav />

      <div className="mb-8 space-y-6 flex items-center max-md:flex-col justify-center md:justify-between ">
        <h1 className="text-2xl font-semibold">Financial Reports</h1>
        <div className="flex space-x-4 ">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)} Report
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={filterType} onValueChange={handleFilterChange}>
                <DropdownMenuRadioItem value="daily">Daily</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="monthly">Monthly</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="yearly">Yearly</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="custom">Custom Range</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          

          <Button 
            onClick={() => generateReport(startDate, endDate, filterType)}
            className="ml-4 hover:bg-[#a78bfa] hover:text-white"
          >
            Generate Report
          </Button>
        </div>
        {showDateRange && (
            <div className="mt-2 md:hidden">
              <DatePickerRange
                startDate={startDate}
                endDate={endDate}
                onChange={handleDateRangeChange}
              />
            </div>
          )}

      </div>
        {showDateRange && (
            <div className=" flex  justify-end items-center pb-8 ">
              <DatePickerRange
                startDate={startDate}
                endDate={endDate}
                onChange={handleDateRangeChange}
              />
            </div>
          )}

      


      {reportData.length > 0 && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Inflow</TableHead>
                <TableHead>Outflow</TableHead>
                <TableHead>Net</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.map((data, index) => (
                <TableRow key={index}>
                  <TableCell>{data.period}</TableCell>
                  <TableCell>{data.totalInflow}</TableCell>
                  <TableCell>{data.totalOutflow}</TableCell>
                  <TableCell>{data.totalInflow - data.totalOutflow}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4">
            {/* <PDFDownloadLink
              document={<PDFReport />}
              fileName="financial_report.pdf"
            >
              {({ blob, url, loading, error }) =>
                loading ? 'Loading document...' : 'Download PDF Report'
              }
            </PDFDownloadLink> */}
          </div>
        </>
      )}
    </div>
  );
};

export default ReportPage;
