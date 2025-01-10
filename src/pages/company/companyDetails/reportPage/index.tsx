import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
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
import CompanyNav from '../../components/CompanyNav';
import { saveAs } from 'file-saver';
import { utils, write } from 'xlsx';
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet
} from '@react-pdf/renderer';

interface CompanyData {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface ReportData {
  period: string;
  totalInflow: number;
  totalOutflow: number;
  categories: {
    [key: string]: {
      inflow: number;
      outflow: number;
      children?: {
        [key: string]: {
          inflow: number;
          outflow: number;
        };
      };
    };
  };
}

const CompanyData: CompanyData[] = [
  {
    id: 1,
    name: 'Mock Company Name',
    email: 'contact@mockcompany.com',
    phone: '+123456789'
  }
];
// Mock initial report data
const mockInitialReportData: ReportData[] = [
  {
    period: '2025-01-01',
    totalInflow: 15000,
    totalOutflow: 12000,
    categories: {
      Salary: {
        inflow: 12000,
        outflow: 0,
        children: {
          John: { inflow: 4000, outflow: 0 },
          Sarah: { inflow: 4000, outflow: 0 },
          Emily: { inflow: 4000, outflow: 0 }
        }
      },
      Marketing: { inflow: 0, outflow: 3000 },
      'Office Supplies': { inflow: 0, outflow: 1000 }
    }
  },
  {
    period: '2025-01-15',
    totalInflow: 20000,
    totalOutflow: 18000,
    categories: {
      Salary: {
        inflow: 15000,
        outflow: 0,
        children: {
          John: { inflow: 5000, outflow: 0 },
          Sarah: { inflow: 5000, outflow: 0 },
          Emily: { inflow: 5000, outflow: 0 }
        }
      },
      Marketing: { inflow: 0, outflow: 4000 },
      'Office Supplies': { inflow: 0, outflow: 1000 }
    }
  }
];

const ReportPage: React.FC = () => {
  const params = useParams();
  const companyId = params?.id as string;

  const [filterType, setFilterType] = useState<
    'daily' | 'monthly' | 'yearly' | 'custom'
  >('monthly');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [reportData, setReportData] = useState<ReportData[]>(
    mockInitialReportData
  );
  const [showDateRange, setShowDateRange] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyData[]>();
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // Number of rows per page

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!companyId) return;

      try {
        setIsLoading(true);
        // Replace this with your actual API call
        const response = await fetch(`/api/companies/${companyId}`);
        const data = await response.json();

        setCompanyData(data);
        const companyStartDate = new Date(data.startDate);
        const companyEndDate = new Date(data.endDate);

        setStartDate(companyStartDate);
        setEndDate(companyEndDate);
      } catch (error) {
        console.error('Error fetching company data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyData();
  }, [companyId]);

  const handleFilterChange = (value: string) => {
    setFilterType(value as 'daily' | 'monthly' | 'yearly' | 'custom');
    setShowDateRange(value === 'custom');
  };

  const handleDateRangeChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const exportToCSV = () => {
    const ws = utils.json_to_sheet(reportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Report');
    const wbout = write(wb, { bookType: 'csv', type: 'binary' });
    saveAs(
      new Blob([s2ab(wbout)], { type: 'application/octet-stream' }),
      'report.csv'
    );
  };

  // Calculate total pages based on data length and page size
  const totalPages = Math.ceil(reportData.length / pageSize);

  // Get the data for the current page
  const paginatedData = reportData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const styles = StyleSheet.create({
    page: {
      padding: 20
    },
    title: {
      fontSize: 18,
      marginBottom: 10
    },
    section: {
      marginBottom: 10
    },
    tableHeader: {
      flexDirection: 'row',
      fontWeight: 'bold',
      borderBottomWidth: 1,
      paddingBottom: 4
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      paddingVertical: 2
    },
    cell: {
      flex: 1,
      textAlign: 'left'
    }
  });

  const ReportPDF = ({ data }: { data: ReportData[] }) => (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Financial Report</Text>
        {data.map((report, index) => (
          <View key={index} style={styles.section}>
            <Text>Period: {report.period}</Text>
            <Text>Total Inflow: {report.totalInflow}</Text>
            <Text>Total Outflow: {report.totalOutflow}</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.cell, { flex: 2 }]}>Category</Text>
              <Text style={styles.cell}>Inflow</Text>
              <Text style={styles.cell}>Outflow</Text>
            </View>
            {Object.entries(report.categories).map(([category, details], i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.cell, { flex: 2 }]}>{category}</Text>
                <Text style={styles.cell}>{details.inflow}</Text>
                <Text style={styles.cell}>{details.outflow}</Text>
              </View>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );

  function s2ab(s: string) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const [showTable, setShowTable] = useState(false);

  const handleGenerateReport = () => {
    setShowTable(true); // Show the table when the button is clicked
  };

  return (
    <div className="container mx-auto p-6">
      <CompanyNav />

      <div className="mb-8  flex flex-col items-center justify-between  md:flex-row">
        <h1 className="text-2xl font-semibold">Financial Reports</h1>
        <div className="flex gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}{' '}
                Report
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={filterType}
                onValueChange={handleFilterChange}
              >
                <DropdownMenuRadioItem value="daily">
                  Daily
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="monthly">
                  Monthly
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="yearly">
                  Yearly
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="custom">
                  Custom Range
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {showDateRange && (
            <DatePickerRange
              onChange={handleDateRangeChange}
              selectedDate={[startDate, endDate]}
            />
          )}
          <Button variant="theme" onClick={handleGenerateReport} className="">
            Generate Report
          </Button>
        </div>
      </div>

      {/* Table visibility based on state */}
      {showTable && (
        <>
          <div className="mb-8 overflow-x-auto">
            {companyData && (
              <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-800">
                  Company Details
                </h2>
                <div className="grid gap-2 text-gray-600">
                  <p>{companyData?.[0]?.name}</p>
                  <p>{companyData?.[0]?.email}</p>
                  <p>{companyData?.[0]?.phone}</p>

                  <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    <p className="font-medium">Report Period:</p>
                    <p>
                      {startDate?.toLocaleDateString()} -{' '}
                      {endDate?.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Total Inflow</TableHead>
                  <TableHead>Total Outflow</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((data, index) => (
                  <TableRow key={index}>
                    <TableCell>{data.period}</TableCell>
                    <TableCell>${data.totalInflow.toLocaleString()}</TableCell>
                    <TableCell>${data.totalOutflow.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex gap-4">
              <Button variant="outline" onClick={exportToCSV}>
                Export to CSV
              </Button>
              <Button variant="outline">
                <PDFDownloadLink
                  document={<ReportPDF data={reportData} />}
                  fileName="financial_report.pdf"
                >
                  {({ loading }) =>
                    loading ? 'Preparing PDF...' : 'Export PDF'
                  }
                </PDFDownloadLink>
              </Button>
            </div>

            {/* <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div> */}
          </div>
        </>
      )}
    </div>
  );
};

export default ReportPage;
